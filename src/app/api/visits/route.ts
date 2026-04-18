import {
    sendApprovalEmail,
    sendDenialEmail,
    sendEmailReceivedConfirmation,
    sendNewRequestNotificationToAdmin,
    sendRequestConfirmationToApplicant,
} from "@/src/lib/email";
import { uploadVisitDocument } from "@/src/lib/supabase-server";
import { prisma } from "@/src/ui/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../auth/[...nextauth]/route";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

async function getSessionUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return {
        id: (session.user as any).id as string,
        role: (session.user as any).role as string,
    };
}

function isAdmin(role: string) {
    return role === "ADMIN" || role === "admin";
}

function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("pt-BR", { timeZone: "America/Maceio" });
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const instituicao = formData.get("instituicao") as string | null;
        const responsavel = formData.get("responsavel") as string | null;
        const email = formData.get("email") as string | null;
        const whatsapp = formData.get("whatsapp") as string | null;
        const quantidadeRaw = formData.get("quantidade") as string | null;
        const dataVisitaRaw = formData.get("dataVisita") as string | null;
        const horaInicio = formData.get("horaInicio") as string | null;
        const horaFim = formData.get("horaFim") as string | null;
        const mensagem = formData.get("mensagem") as string | null;

        if (!instituicao || !responsavel || !email || !whatsapp || !dataVisitaRaw || !horaInicio || !horaFim) {
            return NextResponse.json({ message: "Campos obrigatórios faltando" }, { status: 400 });
        }

        const quantidade = parseInt(quantidadeRaw ?? "", 10);
        if (!Number.isFinite(quantidade) || quantidade <= 0) {
            return NextResponse.json({ message: "Quantidade inválida" }, { status: 400 });
        }

        const files = formData.getAll("anexos") as File[];

        for (const file of files) {
            if (!(file instanceof File) || file.size === 0) continue;
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json({ message: `Arquivo "${file.name}" excede o limite de 5MB` }, { status: 413 });
            }
        }

        const initialLog = [
            {
                id: `log-${Date.now()}-1`,
                stage: "aguardando_email",
                description: "Solicitação enviada no portal e aguardando confirmação de recebimento do e-mail.",
                createdAt: new Date().toISOString(),
            },
        ];

        const visit = await prisma.visit.create({
            data: {
                instituicao,
                responsavel,
                email,
                whatsapp,
                quantidade,
                dataVisita: new Date(dataVisitaRaw),
                horaInicio,
                horaFim,
                mensagem: mensagem || null,
                processLog: initialLog,
            },
        });

        const documentosData: Array<{
            fileName: string;
            fileType: string;
            fileSizeKb: number;
            storagePath: string;
        }> = [];

        for (const file of files) {
            if (!(file instanceof File) || file.size === 0) continue;
            try {
                const storagePath = await uploadVisitDocument(visit.id, file);
                documentosData.push({
                    fileName: file.name,
                    fileType: file.type || "application/octet-stream",
                    fileSizeKb: Math.max(1, Math.round(file.size / 1024)),
                    storagePath,
                });
            } catch (uploadError) {
                console.error(`Erro ao fazer upload de "${file.name}":`, uploadError);
            }
        }

        if (documentosData.length > 0) {
            await prisma.visitDocumento.createMany({
                data: documentosData.map((d) => ({ ...d, visitId: visit.id })),
            });
        }

        const visitWithDocs = await prisma.visit.findUnique({
            where: { id: visit.id },
            include: {
                documentos: {
                    select: { id: true, fileName: true, fileType: true, fileSizeKb: true, uploadedAt: true },
                },
            },
        });

        const emailData = {
            visitId: visit.id,
            instituicao,
            responsavel,
            email,
            quantidade,
            data: formatDate(dataVisitaRaw),
            horaInicio,
            horaFim,
            mensagem: mensagem || undefined,
        };

        Promise.all([
            sendRequestConfirmationToApplicant(emailData).catch((e: unknown) =>
                console.error("[email] Confirmação ao solicitante:", e)
            ),
            sendNewRequestNotificationToAdmin(emailData).catch((e: unknown) =>
                console.error("[email] Notificação ao admin:", e)
            ),
        ]);

        return NextResponse.json(visitWithDocs, { status: 201 });
    } catch (error) {
        console.error("[POST /api/visits]", error);
        return NextResponse.json({ message: "Erro interno do servidor", error: String(error) }, { status: 500 });
    }
}

export async function GET() {
    try {
        const user = await getSessionUser();
        const adminUser = user && isAdmin(user.role);

        if (adminUser) {
            const visits = await prisma.visit.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    documentos: {
                        select: { id: true, fileName: true, fileType: true, fileSizeKb: true, uploadedAt: true },
                    },
                },
            });
            return NextResponse.json(visits);
        }

        const visits = await prisma.visit.findMany({
            orderBy: { createdAt: "desc" },
            select: { id: true, instituicao: true, dataVisita: true, horaInicio: true, horaFim: true, status: true },
        });
        return NextResponse.json(visits);
    } catch (error) {
        console.error("[GET /api/visits]", error);
        return NextResponse.json({ message: "Erro interno do servidor", error: String(error) }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await getSessionUser();
        if (!user || !isAdmin(user.role)) {
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
        }

        const body = await req.json();
        const { id, action, reason } = body as { id: number; action: string; reason?: string };

        if (!id || !action) {
            return NextResponse.json({ message: "ID e ação são obrigatórios" }, { status: 400 });
        }

        const current = await prisma.visit.findUnique({ where: { id } });
        if (!current) {
            return NextResponse.json({ message: "Visita não encontrada" }, { status: 404 });
        }

        const now = new Date().toISOString();
        const currentLog = Array.isArray(current.processLog) ? (current.processLog as any[]) : [];

        function appendLog(stage: string, description: string) {
            return [
                ...currentLog,
                { id: `log-${current!.id}-${currentLog.length + 1}`, stage, description, createdAt: now },
            ];
        }

        let updateData: Record<string, unknown> = {};
        let emailTask: Promise<void> | null = null;

        switch (action) {
            case "confirmEmail":
                if (current.processStage !== "aguardando_email") {
                    return NextResponse.json({ message: "Estágio inválido" }, { status: 400 });
                }
                updateData = {
                    processStage: "email_recebido",
                    processLog: appendLog("email_recebido", "Recebimento do e-mail confirmado pelo admin."),
                };
                emailTask = sendEmailReceivedConfirmation(current.email, current.responsavel, current.instituicao);
                break;

            case "approveDocumentation":
                if (!["email_recebido", "documentacao_em_analise"].includes(current.processStage)) {
                    return NextResponse.json({ message: "Estágio inválido" }, { status: 400 });
                }
                updateData = {
                    processStage: "documentacao_em_analise",
                    documentacaoStatus: "conferida",
                    processLog: appendLog(
                        "documentacao_em_analise",
                        "Documentação conferida pelo admin. Pronto para envio ao IFAL."
                    ),
                };
                break;

            case "markDocumentationIncomplete":
                if (!["email_recebido", "documentacao_em_analise"].includes(current.processStage)) {
                    return NextResponse.json({ message: "Estágio inválido" }, { status: 400 });
                }
                updateData = {
                    processStage: "documentacao_em_analise",
                    documentacaoStatus: "incompleta",
                    processLog: appendLog(
                        "documentacao_em_analise",
                        "Documentação marcada como incompleta. Necessário ajuste antes do envio ao IFAL."
                    ),
                };
                break;

            case "sendToIfal":
                if (current.processStage !== "documentacao_em_analise" || current.documentacaoStatus !== "conferida") {
                    return NextResponse.json(
                        { message: "Documentação precisa estar conferida para enviar ao IFAL" },
                        { status: 400 }
                    );
                }
                updateData = {
                    processStage: "aguardando_aprovacao_ifal",
                    ifalStatus: "aguardando",
                    processLog: appendLog(
                        "aguardando_aprovacao_ifal",
                        "Processo encaminhado para aprovação institucional do IFAL."
                    ),
                };
                break;

            case "ifalApprove":
                if (current.processStage !== "aguardando_aprovacao_ifal") {
                    return NextResponse.json({ message: "Estágio inválido" }, { status: 400 });
                }
                updateData = {
                    processStage: "aprovado_ifal",
                    status: "aprovado",
                    ifalStatus: "aprovado",
                    reviewedAt: new Date(),
                    processLog: appendLog(
                        "aprovado_ifal",
                        "IFAL aprovou a visita. Agendamento confirmado para a escola solicitante."
                    ),
                };
                emailTask = sendApprovalEmail(
                    current.email,
                    current.responsavel,
                    formatDate(current.dataVisita),
                    current.horaInicio,
                    current.horaFim,
                    current.instituicao
                );
                break;

            case "ifalDeny":
                if (current.processStage !== "aguardando_aprovacao_ifal") {
                    return NextResponse.json({ message: "Estágio inválido" }, { status: 400 });
                }
                updateData = {
                    processStage: "negado_ifal",
                    status: "negado",
                    ifalStatus: "negado",
                    reviewedAt: new Date(),
                    motivoNegativa: reason?.trim() || "Processo negado na aprovação final do IFAL.",
                    processLog: appendLog(
                        "negado_ifal",
                        `IFAL negou a visita. ${reason?.trim() || "Sem detalhamento enviado."}`
                    ),
                };
                emailTask = sendDenialEmail(
                    current.email,
                    current.responsavel,
                    current.instituicao,
                    reason?.trim() || "Processo negado na aprovação final do IFAL."
                );
                break;

            case "adminDeny":
                if (current.status === "negado") {
                    return NextResponse.json({ message: "Visita já negada" }, { status: 400 });
                }
                if (!reason?.trim()) {
                    return NextResponse.json({ message: "Motivo da negativa é obrigatório" }, { status: 400 });
                }
                updateData = {
                    processStage: "negado_admin",
                    status: "negado",
                    reviewedAt: new Date(),
                    motivoNegativa: reason.trim(),
                    processLog: appendLog("negado_admin", `Solicitação negada pelo admin. ${reason.trim()}`),
                };
                emailTask = sendDenialEmail(current.email, current.responsavel, current.instituicao, reason.trim());
                break;

            default:
                return NextResponse.json({ message: "Ação inválida" }, { status: 400 });
        }

        const updated = await prisma.visit.update({
            where: { id },
            data: updateData,
            include: {
                documentos: {
                    select: { id: true, fileName: true, fileType: true, fileSizeKb: true, uploadedAt: true },
                },
            },
        });

        if (emailTask) {
            emailTask.catch((e) => console.error("[email] PATCH action:", action, e));
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[PATCH /api/visits]", error);
        return NextResponse.json({ message: "Erro interno do servidor", error: String(error) }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getSessionUser();
        if (!user || !isAdmin(user.role)) {
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = Number(searchParams.get("id"));

        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        await prisma.visit.delete({ where: { id } });
        return NextResponse.json({ message: "Visita removida com sucesso" });
    } catch (error) {
        console.error("[DELETE /api/visits]", error);
        return NextResponse.json({ message: "Erro interno do servidor", error: String(error) }, { status: 500 });
    }
}
