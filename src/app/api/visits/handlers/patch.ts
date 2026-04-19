import { prisma } from "@/src/infra/data/prisma";
import { sendApprovalEmail, sendDenialEmail, sendEmailReceivedConfirmation } from "@/src/lib/email";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";
import { isAdmin } from "./get";

async function getSessionUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return {
        id: (session.user as any).id as string,
        role: (session.user as any).role as string,
    };
}

function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("pt-BR", { timeZone: "America/Maceio" });
}

export async function patchHandlers(req: Request) {
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
