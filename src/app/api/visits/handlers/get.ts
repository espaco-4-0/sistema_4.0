import { prisma } from "@/src/infra/data/prisma";
import { buildHolidayMap } from "@/src/lib/visits/holiday-utils";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

export interface CalendarEvent {
    id: string | number;
    instituicao: string;
    dataVisita: string;
    horaInicio: string;
    horaFim: string;
    status: string;
    isHoliday?: boolean;
    holidayName?: string;
}

async function getSessionUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    const user = session.user as { id: string; role: string };
    return {
        id: user.id,
        role: user.role,
    };
}

export function isAdmin(role: string) {
    return role === "ADMIN" || role === "admin";
}

function toComparableDate(value: unknown): Date {
    if (value instanceof Date) return value;
    if (typeof value === "string") {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return new Date(`${value}T00:00:00`);
        }
        const d = new Date(value);
        if (!isNaN(d.getTime())) return d;
        return new Date(`${value}T00:00:00`);
    }
    return new Date(0);
}

export async function getHandlers() {
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
                    paradas: {
                        include: {
                            local: {
                                select: { nome: true },
                            },
                        },
                    },
                },
            });
            return NextResponse.json(visits);
        }

        const visits = await prisma.visit.findMany({
            orderBy: { createdAt: "desc" },
            select: { id: true, instituicao: true, dataVisita: true, horaInicio: true, horaFim: true, status: true },
        });

        const year = new Date().getFullYear();
        const holidaysMap = buildHolidayMap(year);

        let negativeId = -1;
        const holidayEntries = Array.from(holidaysMap.entries());

        const holidayEvents: CalendarEvent[] = holidayEntries.map(([dateIso, name]) => {
            const ev: CalendarEvent = {
                id: negativeId,
                instituicao: `Feriado: ${name}`,
                dataVisita: dateIso, // YYYY-MM-DD
                horaInicio: "00:00",
                horaFim: "23:59",
                status: "feriado",
                isHoliday: true,
                holidayName: name,
            };
            negativeId -= 1;
            return ev;
        });

        const normalizedVisits: CalendarEvent[] = visits.map((v) => {
            const data = v.dataVisita;
            const dateStr = data instanceof Date ? data.toISOString().slice(0, 10) : String(data).slice(0, 10);
            return {
                id: v.id,
                instituicao: v.instituicao,
                dataVisita: dateStr,
                horaInicio: v.horaInicio ?? "00:00",
                horaFim: v.horaFim ?? "00:00",
                status: v.status ?? "pendente",
            };
        });

        const merged: CalendarEvent[] = [...normalizedVisits, ...holidayEvents].sort((a, b) => {
            const da = toComparableDate(a.dataVisita);
            const db = toComparableDate(b.dataVisita);
            if (da.getTime() !== db.getTime()) return da.getTime() - db.getTime();

            const aStart = typeof a.horaInicio === "string" ? a.horaInicio : "00:00";
            const bStart = typeof b.horaInicio === "string" ? b.horaInicio : "00:00";
            const [ah, am] = aStart.split(":").map((s) => Number.parseInt(s, 10) || 0);
            const [bh, bm] = bStart.split(":").map((s) => Number.parseInt(s, 10) || 0);
            return ah * 60 + am - (bh * 60 + bm);
        });

        return NextResponse.json(merged);
    } catch (error) {
        console.error("[GET /api/visits]", error);
        return NextResponse.json({ message: "Erro interno do servidor", error: String(error) }, { status: 500 });
    }
}
