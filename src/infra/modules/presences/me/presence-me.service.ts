import { rememberCache } from "@/lib/cache";
import { prisma } from "@/src/infra/data/prisma";

type EventSituation = "pending" | "confirmed" | "absent";

function mapSituation(confirmed: boolean, confirmedAt: Date | null): EventSituation {
    if (confirmed) return "confirmed";
    if (confirmedAt) return "absent";
    return "pending";
}

export async function listPresenceEventsByUser(userId: string) {
    return rememberCache(
        "presences:me",
        userId,
        async () => {
            const presences = await prisma.presence.findMany({
                where: { userId },
                orderBy: { createdAt: "asc" },
                include: {
                    lesson: {
                        include: {
                            professor: {
                                select: {
                                    fullName: true,
                                },
                            },
                            location: {
                                select: {
                                    name: true,
                                },
                            },
                            course: {
                                select: {
                                    title: true,
                                    description: true,
                                },
                            },
                        },
                    },
                },
            });

            return presences.map((presence) => {
                const start = presence.lesson.startDate;
                const end = new Date(start.getTime() + presence.lesson.durationMin * 60 * 1000);
                const situation = mapSituation(presence.confirmed, presence.confirmedAt ?? null);

                return {
                    id: presence.id,
                    title: presence.lesson.title ?? presence.lesson.course.title,
                    description: presence.lesson.course.description ?? "Atividade do Espaço 4.0",
                    instructor: presence.lesson.professor.fullName,
                    location: presence.lesson.location?.name ?? "Local a definir",
                    situation,
                    observation: "",
                    registeredAt: presence.confirmedAt,
                    start,
                    end,
                };
            });
        },
        60
    );
}
