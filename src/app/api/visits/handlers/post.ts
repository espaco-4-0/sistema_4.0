import { prisma } from "@/src/infra/data/prisma";
import { sendNewRequestNotificationToAdmin, sendRequestConfirmationToApplicant } from "@/src/lib/email";
import { uploadVisitDocument } from "@/src/lib/supabase-server";
import { enforceSlotSelection } from "@/src/lib/visits/slots";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function postHandlers(req: Request) {
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
        const slotId = formData.get("slotId") as string | null;

        if (!instituicao || !responsavel || !email || !whatsapp || !dataVisitaRaw || !horaInicio || !horaFim) {
            return NextResponse.json({ message: "Campos obrigatórios faltando" }, { status: 400 });
        }

        if (!slotId) {
            return NextResponse.json(
                { message: "É necessário informar o slot (slotId) para agendamento." },
                { status: 400 }
            );
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

        const visitDate = new Date(dataVisitaRaw);
        if (isNaN(visitDate.getTime())) {
            return NextResponse.json({ message: "Data inválida" }, { status: 400 });
        }
        visitDate.setHours(0, 0, 0, 0);

        const existingEventsFetcher = async (date: Date) => {
            const rows = await prisma.visit.findMany({
                where: { dataVisita: date },
                select: { horaInicio: true, horaFim: true },
            });
            return rows.map((r) => ({ horaInicio: r.horaInicio, horaFim: r.horaFim }));
        };

        const enforcement = await enforceSlotSelection(
            { date: visitDate, slotId, eventType: undefined },
            existingEventsFetcher
        );

        if (!enforcement.ok) {
            const status = enforcement.status ?? 400;
            return NextResponse.json(
                { message: enforcement.message, holidayName: enforcement.holidayName },
                { status }
            );
        }

        const initialLog = [
            {
                id: `log-${Date.now()}-1`,
                stage: "aguardando_email",
                description: `Solicitação enviada no portal. Slot selecionado: ${enforcement.slot.id}`,
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

        const formatDate = (date: Date | string) =>
            new Date(date).toLocaleDateString("pt-BR", { timeZone: "America/Maceio" });

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
