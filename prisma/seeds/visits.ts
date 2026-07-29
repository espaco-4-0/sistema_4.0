import { PrismaClient } from "../../src/generated/prisma/client";

export async function seedVisits(prisma: PrismaClient) {
    
    const weekdayRules = [
        { dayOfWeek: 0, isAvailable: false },
        { dayOfWeek: 1, isAvailable: true },
        { dayOfWeek: 2, isAvailable: true },
        { dayOfWeek: 3, isAvailable: true },
        { dayOfWeek: 4, isAvailable: true },
        { dayOfWeek: 5, isAvailable: true },
        { dayOfWeek: 6, isAvailable: false },
    ];

    for (const rule of weekdayRules) {
        await prisma.visitWeekdayRule.upsert({
            where: { dayOfWeek: rule.dayOfWeek },
            update: {},
            create: rule,
        });
    }

    console.log("Regras padrão de dias de semana criadas para visitas.");
}
