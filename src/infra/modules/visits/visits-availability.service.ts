import { prisma } from "@/src/infra/data/prisma";
import { ValidationError } from "@/src/lib/errors/AppError";

export async function getVisitAvailability() {
    const weekdayRules = await prisma.visitWeekdayRule.findMany({
        orderBy: { dayOfWeek: "asc" },
    });

    const dateRules = await prisma.visitDateRule.findMany({
        orderBy: { date: "asc" },
    });

    const formattedDateRules = dateRules.map((rule) => {
        const dateStr =
            rule.date instanceof Date ? rule.date.toISOString().slice(0, 10) : String(rule.date).slice(0, 10);
        return {
            id: rule.id,
            date: dateStr,
            isAvailable: rule.isAvailable,
            reason: rule.reason,
        };
    });

    return {
        weekdayRules,
        dateRules: formattedDateRules,
    };
}

export async function saveWeekdayRules(rules: unknown) {
    if (!Array.isArray(rules)) {
        throw new ValidationError("Formato inválido para regras semanais");
    }

    if (rules.length > 7) {
        throw new ValidationError("Quantidade de regras excede o limite semanal");
    }

    for (const rule of rules as Array<Record<string, unknown>>) {
        const day = parseInt(String(rule.dayOfWeek), 10);
        if (isNaN(day) || day < 0 || day > 6) {
            throw new ValidationError("Dia da semana inválido (deve ser entre 0 e 6)");
        }

        await prisma.visitWeekdayRule.upsert({
            where: { dayOfWeek: day },
            update: { isAvailable: Boolean(rule.isAvailable) },
            create: { dayOfWeek: day, isAvailable: Boolean(rule.isAvailable) },
        });
    }

    return { message: "Regras semanais atualizadas com sucesso" };
}

export async function saveDateRule(dates: unknown, isAvailable: unknown, reason?: unknown) {
    if (!Array.isArray(dates) || dates.length === 0) {
        throw new ValidationError("Formato inválido ou lista de datas vazia");
    }

    if (dates.length > 366) {
        throw new ValidationError("Intervalo de datas limite excedido (máximo de 1 ano)");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sanitizedReason = reason ? String(reason).trim().slice(0, 255) : null;

    for (const dateStr of dates) {
        const parsedDate = new Date(`${String(dateStr)}T00:00:00`);
        if (isNaN(parsedDate.getTime())) continue;

        if (parsedDate < today) {
            throw new ValidationError("Não é possível alterar a disponibilidade de datas passadas");
        }

        await prisma.visitDateRule.upsert({
            where: { date: parsedDate },
            update: { isAvailable: Boolean(isAvailable), reason: sanitizedReason },
            create: { date: parsedDate, isAvailable: Boolean(isAvailable), reason: sanitizedReason },
        });
    }

    return { message: "Exceções de data atualizadas com sucesso" };
}

export async function deleteDateRule(date: unknown) {
    if (!date) {
        throw new ValidationError("Data é obrigatória");
    }

    const parsedDate = new Date(`${String(date)}T00:00:00`);
    if (isNaN(parsedDate.getTime())) {
        throw new ValidationError("Data inválida");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
        throw new ValidationError("Não é possível alterar a disponibilidade de datas passadas");
    }

    await prisma.visitDateRule.deleteMany({
        where: { date: parsedDate },
    });

    return { message: "Exceção de data removida com sucesso" };
}

export async function handleAvailabilityAction(body: Record<string, unknown>) {
    const { action } = body;

    if (action === "saveWeekdayRules") {
        return saveWeekdayRules(body.rules);
    }

    if (action === "saveDateRule") {
        return saveDateRule(body.dates, body.isAvailable, body.reason);
    }

    if (action === "deleteDateRule") {
        return deleteDateRule(body.date);
    }

    throw new ValidationError("Ação desconhecida");
}
