import { rememberCache } from "@/lib/cache";
import { prisma } from "@/src/ui/lib/prisma";

type EventSituation = "pending" | "confirmed" | "absent";

function mapSituation(confirmada: boolean, confirmedAt: Date | null): EventSituation {
    if (confirmada) return "confirmed";
    if (confirmedAt) return "absent";
    return "pending";
}

export async function listPresenceEventsByUser(userId: string) {
    return rememberCache(
        "presences:me",
        userId,
        async () => {
            const presences = await prisma.presenca.findMany({
                where: { userId },
                orderBy: { createdAt: "asc" },
                include: {
                    aula: {
                        include: {
                            professor: {
                                select: {
                                    nomeCompleto: true,
                                },
                            },
                            local: {
                                select: {
                                    nome: true,
                                },
                            },
                            curso: {
                                select: {
                                    titulo: true,
                                    descricao: true,
                                },
                            },
                        },
                    },
                },
            });

            return presences.map((presence) => {
                const start = presence.aula.dataHoraInicio;
                const end = new Date(start.getTime() + presence.aula.duracaoMin * 60 * 1000);
                const situation = mapSituation(presence.confirmada, presence.confirmedAt ?? null);

                return {
                    id: presence.id,
                    title: presence.aula.titulo ?? presence.aula.curso.titulo,
                    description: presence.aula.curso.descricao ?? "Atividade do Espaço 4.0",
                    instructor: presence.aula.professor.nomeCompleto,
                    location: presence.aula.local?.nome ?? "Local a definir",
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
