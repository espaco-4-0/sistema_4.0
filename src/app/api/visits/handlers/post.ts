import { prisma } from "@/src/infra/data/prisma";
import { sendNewRequestNotificationToAdmin, sendRequestConfirmationToApplicant } from "@/src/lib/email";
import { uploadVisitDocument } from "@/src/lib/supabase-server";
import { getHolidayNameSafe } from "@/src/lib/visits/holiday-utils";
import { hhmmToMinutes } from "@/src/lib/visits/slots";
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
        const paradasRaw = formData.get("paradas") as string | null;

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

        const visitDateStr = dataVisitaRaw.includes("T") ? dataVisitaRaw : `${dataVisitaRaw}T00:00:00`;
        const visitDate = new Date(visitDateStr);

        if (isNaN(visitDate.getTime())) {
            return NextResponse.json({ message: "Data inválida" }, { status: 400 });
        }

        const dayOfWeek = visitDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const holidayName = getHolidayNameSafe(visitDate);

        if (isWeekend || holidayName) {
            return NextResponse.json(
                { message: holidayName ? `Feriado: ${holidayName}` : "Finais de semana não permitidos" },
                { status: 400 }
            );
        }

        const dateStart = new Date(visitDate);
        dateStart.setHours(0, 0, 0, 0);
        const dateNext = new Date(dateStart);
        dateNext.setDate(dateNext.getDate() + 1);

        // Verificação de conflitos (30 min de intervalo)
        const existingEvents = await prisma.visit.findMany({
            where: {
                AND: [
                    { visitDate: { gte: dateStart } },
                    { visitDate: { lt: dateNext } },
                    { status: { not: "DENIED" } },
                ],
            },
            select: { startTime: true, endTime: true },
        });

        const startMin = hhmmToMinutes(horaInicio);
        const endMin = hhmmToMinutes(horaFim);
        const minGap = 30;

        for (const ev of existingEvents) {
            const evStart = hhmmToMinutes(ev.startTime);
            const evEnd = hhmmToMinutes(ev.endTime);

            const startBoundary = evStart - minGap;
            const endBoundary = evEnd + minGap;

            if (startMin < endBoundary && endMin > startBoundary) {
                return NextResponse.json(
                    { message: "Conflito de horário com outra visita (mínimo 30 min de intervalo)." },
                    { status: 409 }
                );
            }
        }

        const initialLog = [
            {
                id: `log-${Date.now()}-1`,
                stage: "WAITING_EMAIL",
                description: `Solicitação enviada no portal. Horário: ${horaInicio} - ${horaFim}`,
                createdAt: new Date().toISOString(),
            },
        ];

        let paradas: string[] = [];
        try {
            if (paradasRaw) paradas = JSON.parse(paradasRaw);
        } catch (e) {
            console.error("Erro ao fazer parse das paradas:", e);
        }

        const visit = await prisma.visit.create({
            data: {
                institution: instituicao,
                responsible: responsavel,
                email,
                whatsapp,
                visitorCount: quantidade,
                visitDate,
                startTime: horaInicio,
                endTime: horaFim,
                message: mensagem || null,
                processLog: initialLog,
                VisitLocation: {
                    create: paradas.map((localId) => ({
                        locationId: localId,
                    })),
                },
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
                // Rollback: deleta a visita se falhar o anexo para não deixar registros soltos
                await prisma.visit.delete({ where: { id: visit.id } }).catch(() => null);
                return NextResponse.json(
                    { message: `Erro ao enviar o anexo "${file.name}". Solicitação cancelada, tente novamente.` },
                    { status: 500 }
                );
            }
        }

        if (documentosData.length > 0) {
            await prisma.visitDocument.createMany({
                data: documentosData.map((d) => ({ ...d, visitId: visit.id })),
            });
        }

        const visitWithDocs = await prisma.visit.findUnique({
            where: { id: visit.id },
            include: {
                VisitDocument: {
                    select: { id: true, fileName: true, fileType: true, fileSizeKb: true, uploadedAt: true },
                },
            },
        });

        // String segura de data para o email: YYYY-MM-DD -> DD/MM/YYYY
        const safeFormattedDate = dataVisitaRaw.split("-").reverse().join("/");

        const emailData = {
            visitId: visit.id,
            instituicao,
            responsavel,
            email,
            quantidade,
            data: safeFormattedDate,
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
