import { prisma } from "@/src/infra/data/prisma";
import { buildHolidayMap } from "@/src/lib/visits/holiday-utils";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

async function getSessionUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return {
        id: (session.user as any).id as string,
        role: (session.user as any).role as string,
    };
}

export function isAdmin(role: string) {
    return role === "ADMIN" || role === "admin";
}

function toComparableDate(value: unknown): Date {
    if (value instanceof Date) return value;
    if (typeof value === "string") {
        const d = new Date(value);
        if (!isNaN(d.getTime())) return d;
        const alt = new Date(`${value}T00:00:00`);
        return alt;
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

        type HolidayEvent = {
            id: number;
            instituicao: string;
            dataVisita: string;
            horaInicio: string;
            horaFim: string;
            status: string;
            isHoliday: true;
            holidayName: string;
        };

        let negativeId = -1;
        const holidayEntries = Array.from(holidaysMap.entries()) as [string, string][];
        const holidayEvents: HolidayEvent[] = holidayEntries.map(([dateIso, name]) => {
            const ev: HolidayEvent = {
                id: negativeId,
                instituicao: `Feriado: ${name}`,
                dataVisita: dateIso,
                horaInicio: "00:00",
                horaFim: "23:59",
                status: "feriado",
                isHoliday: true,
                holidayName: name,
            };
            negativeId -= 1;
            return ev;
        });

        const merged = ([...(visits as any[]), ...holidayEvents] as any[]).sort((a: any, b: any) => {
            const da = toComparableDate(a.dataVisita);
            const db = toComparableDate(b.dataVisita);
            if (da.getTime() !== db.getTime()) return da.getTime() - db.getTime();

            const aStart = typeof a.horaInicio === "string" ? a.horaInicio : "00:00";
            const bStart = typeof b.horaInicio === "string" ? b.horaInicio : "00:00";
            const [ah, am] = aStart.split(":").map((s: string) => Number.parseInt(s, 10) || 0);
            const [bh, bm] = bStart.split(":").map((s: string) => Number.parseInt(s, 10) || 0);
            return ah * 60 + am - (bh * 60 + bm);
        });

        return NextResponse.json(merged as any[]);
    } catch (error) {
        console.error("[GET /api/visits]", error);
        return NextResponse.json({ message: "Erro interno do servidor", error: String(error) }, { status: 500 });
    }
}
