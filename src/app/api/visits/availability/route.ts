import { prisma } from "@/src/infra/data/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

async function getSessionUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return session.user as { id: string; role: string };
}

export async function GET() {
    try {
        const weekdayRules = await prisma.visitWeekdayRule.findMany({
            orderBy: { dayOfWeek: "asc" },
        });

        const dateRules = await prisma.visitDateRule.findMany({
            orderBy: { date: "asc" },
        });

        const formattedDateRules = dateRules.map((rule) => {
            const dateStr = rule.date instanceof Date 
                ? rule.date.toISOString().slice(0, 10) 
                : String(rule.date).slice(0, 10);
            return {
                id: rule.id,
                date: dateStr,
                isAvailable: rule.isAvailable,
                reason: rule.reason,
            };
        });

        return NextResponse.json({
            weekdayRules,
            dateRules: formattedDateRules,
        });
    } catch (error) {
        console.error("[GET /api/visits/availability]", error);
        return NextResponse.json({ message: "Erro ao obter disponibilidade", error: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getSessionUser();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ message: "Acesso não autorizado" }, { status: 403 });
        }

        const body = await req.json();
        const { action } = body;

        if (action === "saveWeekdayRules") {
            const { rules } = body;
            if (!Array.isArray(rules)) {
                return NextResponse.json({ message: "Formato inválido para regras semanais" }, { status: 400 });
            }

            if (rules.length > 7) {
                return NextResponse.json({ message: "Quantidade de regras excede o limite semanal" }, { status: 400 });
            }

            for (const rule of rules) {
                const day = parseInt(String(rule.dayOfWeek), 10);
                if (isNaN(day) || day < 0 || day > 6) {
                    return NextResponse.json({ message: "Dia da semana inválido (deve ser entre 0 e 6)" }, { status: 400 });
                }

                await prisma.visitWeekdayRule.upsert({
                    where: { dayOfWeek: day },
                    update: { isAvailable: Boolean(rule.isAvailable) },
                    create: { dayOfWeek: day, isAvailable: Boolean(rule.isAvailable) },
                });
            }

            return NextResponse.json({ message: "Regras semanais atualizadas com sucesso" });
        } 
        
        if (action === "saveDateRule") {
            const { dates, isAvailable, reason } = body;
            if (!Array.isArray(dates) || dates.length === 0) {
                return NextResponse.json({ message: "Formato inválido ou lista de datas vazia" }, { status: 400 });
            }

            if (dates.length > 366) {
                return NextResponse.json({ message: "Intervalo de datas limite excedido (máximo de 1 ano)" }, { status: 400 });
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const sanitizedReason = reason ? String(reason).trim().slice(0, 255) : null;

            for (const dateStr of dates) {
                const parsedDate = new Date(`${dateStr}T00:00:00`);
                if (isNaN(parsedDate.getTime())) continue;

                if (parsedDate < today) {
                    return NextResponse.json({ message: "Não é possível alterar a disponibilidade de datas passadas" }, { status: 400 });
                }

                await prisma.visitDateRule.upsert({
                    where: { date: parsedDate },
                    update: { isAvailable: Boolean(isAvailable), reason: sanitizedReason },
                    create: { date: parsedDate, isAvailable: Boolean(isAvailable), reason: sanitizedReason },
                });
            }

            return NextResponse.json({ message: "Exceções de data atualizadas com sucesso" });
        }

        if (action === "deleteDateRule") {
            const { date } = body;
            if (!date) {
                return NextResponse.json({ message: "Data é obrigatória" }, { status: 400 });
            }

            const parsedDate = new Date(`${date}T00:00:00`);
            if (isNaN(parsedDate.getTime())) {
                return NextResponse.json({ message: "Data inválida" }, { status: 400 });
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (parsedDate < today) {
                return NextResponse.json({ message: "Não é possível alterar a disponibilidade de datas passadas" }, { status: 400 });
            }

            await prisma.visitDateRule.deleteMany({
                where: { date: parsedDate },
            });

            return NextResponse.json({ message: "Exceção de data removida com sucesso" });
        }

        return NextResponse.json({ message: "Ação desconhecida" }, { status: 400 });
    } catch (error) {
        console.error("[POST /api/visits/availability]", error);
        return NextResponse.json({ message: "Erro ao salvar disponibilidade", error: String(error) }, { status: 500 });
    }
}
