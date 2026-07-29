import { beforeEach, describe, expect, it, vi } from "vitest";

import { courseAgendaSchema, createCourseSchema, patchCourseSchema, replaceAccessSchema } from "./courses.schema";

vi.mock("@/src/infra/data/prisma", () => ({
    prisma: {
        location: { findMany: vi.fn() },
        lesson: { count: vi.fn() },
        enrollment: { count: vi.fn() },
        courseAccess: { findMany: vi.fn() },
    },
}));

const { prisma } = await import("@/src/infra/data/prisma");
const { findInvalidScheduleLocations, getCourseDeletionBlockers, listEnabledResourcesForUser } =
    await import("./course-admin.service");

function makeCoursePayload(overrides = {}) {
    return {
        titulo: "Curso de Robótica",
        descricao: "Introdução à robótica educacional",
        cargaHoraria: 40,
        ...overrides,
    };
}

describe("createCourseSchema", () => {
    it("aceita um curso com período, agenda e acessos", () => {
        const parsed = createCourseSchema.safeParse(
            makeCoursePayload({
                dataInicio: "2026-08-03",
                dataFim: "2026-11-30",
                agenda: [
                    { diaSemana: 1, horaInicio: "08:00", horaFim: "10:00" },
                    { diaSemana: 1, horaInicio: "14:00", horaFim: "16:00" },
                    { diaSemana: 3, horaInicio: "08:00", horaFim: "10:00" },
                ],
                acessos: [
                    { recurso: "LESSONS", liberado: true },
                    { recurso: "CERTIFICATES", liberado: false },
                ],
            })
        );

        expect(parsed.success).toBe(true);
    });

    it("rejeita data de término anterior à de início", () => {
        const parsed = createCourseSchema.safeParse(
            makeCoursePayload({ dataInicio: "2026-11-30", dataFim: "2026-08-03" })
        );

        expect(parsed.success).toBe(false);
    });

    it("rejeita horário de término anterior ao de início", () => {
        const parsed = createCourseSchema.safeParse(
            makeCoursePayload({ agenda: [{ diaSemana: 2, horaInicio: "16:00", horaFim: "14:00" }] })
        );

        expect(parsed.success).toBe(false);
    });

    it("rejeita dia da semana fora do intervalo 0-6", () => {
        const parsed = createCourseSchema.safeParse(
            makeCoursePayload({ agenda: [{ diaSemana: 7, horaInicio: "08:00", horaFim: "10:00" }] })
        );

        expect(parsed.success).toBe(false);
    });

    it("rejeita horário em formato inválido", () => {
        const parsed = createCourseSchema.safeParse(
            makeCoursePayload({ agenda: [{ diaSemana: 1, horaInicio: "8h", horaFim: "10:00" }] })
        );

        expect(parsed.success).toBe(false);
    });
});

describe("courseAgendaSchema", () => {
    it("rejeita horários sobrepostos no mesmo dia", () => {
        const parsed = courseAgendaSchema.safeParse([
            { diaSemana: 1, horaInicio: "08:00", horaFim: "10:00" },
            { diaSemana: 1, horaInicio: "09:00", horaFim: "11:00" },
        ]);

        expect(parsed.success).toBe(false);
    });

    it("aceita horários adjacentes no mesmo dia", () => {
        const parsed = courseAgendaSchema.safeParse([
            { diaSemana: 1, horaInicio: "08:00", horaFim: "10:00" },
            { diaSemana: 1, horaInicio: "10:00", horaFim: "12:00" },
        ]);

        expect(parsed.success).toBe(true);
    });

    it("aceita o mesmo horário em dias diferentes", () => {
        const parsed = courseAgendaSchema.safeParse([
            { diaSemana: 1, horaInicio: "08:00", horaFim: "10:00" },
            { diaSemana: 4, horaInicio: "08:00", horaFim: "10:00" },
        ]);

        expect(parsed.success).toBe(true);
    });
});

describe("patchCourseSchema", () => {
    it("rejeita payload vazio", () => {
        expect(patchCourseSchema.safeParse({}).success).toBe(false);
    });

    it("aceita apenas a inativação do curso", () => {
        expect(patchCourseSchema.safeParse({ ativo: false }).success).toBe(true);
    });

    it("aceita agenda vazia para limpar os horários", () => {
        expect(patchCourseSchema.safeParse({ agenda: [] }).success).toBe(true);
    });
});

describe("replaceAccessSchema", () => {
    it("rejeita recurso desconhecido", () => {
        const parsed = replaceAccessSchema.safeParse({ acessos: [{ recurso: "FINANCEIRO", liberado: true }] });

        expect(parsed.success).toBe(false);
    });

    it("rejeita recurso duplicado", () => {
        const parsed = replaceAccessSchema.safeParse({
            acessos: [
                { recurso: "BLOG", liberado: true },
                { recurso: "BLOG", liberado: false },
            ],
        });

        expect(parsed.success).toBe(false);
    });
});

describe("findInvalidScheduleLocations", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("retorna os ids que não existem ou estão inativos", async () => {
        vi.mocked(prisma.location.findMany).mockResolvedValue([{ id: "loc_1" }] as never);

        const invalid = await findInvalidScheduleLocations([
            { diaSemana: 1, horaInicio: "08:00", horaFim: "10:00", localId: "loc_1" },
            { diaSemana: 2, horaInicio: "08:00", horaFim: "10:00", localId: "loc_inativo" },
        ]);

        expect(invalid).toEqual(["loc_inativo"]);
    });

    it("não consulta o banco quando nenhum local é informado", async () => {
        const invalid = await findInvalidScheduleLocations([{ diaSemana: 1, horaInicio: "08:00", horaFim: "10:00" }]);

        expect(invalid).toEqual([]);
        expect(prisma.location.findMany).not.toHaveBeenCalled();
    });
});

describe("getCourseDeletionBlockers", () => {
    it("reporta aulas e matrículas vinculadas", async () => {
        vi.mocked(prisma.lesson.count).mockResolvedValue(3 as never);
        vi.mocked(prisma.enrollment.count).mockResolvedValue(12 as never);

        await expect(getCourseDeletionBlockers("course_1")).resolves.toEqual({ lessons: 3, enrollments: 12 });
    });
});

describe("listEnabledResourcesForUser", () => {
    it("retorna os recursos liberados nos cursos do aluno", async () => {
        vi.mocked(prisma.courseAccess.findMany).mockResolvedValue([
            { resource: "LESSONS" },
            { resource: "CERTIFICATES" },
        ] as never);

        await expect(listEnabledResourcesForUser("user_1")).resolves.toEqual(["LESSONS", "CERTIFICATES"]);
    });
});
