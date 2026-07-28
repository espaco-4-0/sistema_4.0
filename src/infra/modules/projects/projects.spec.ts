import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    approveProjectRequestSchema,
    createProjectRequestSchema,
    createTaskSchema,
    patchProjectRequestSchema,
    patchProjectSchema,
    rejectProjectRequestSchema,
    taskStatusSchema,
} from "./projects.schema";

vi.mock("@/src/infra/data/prisma", () => ({
    prisma: {
        user: { findMany: vi.fn() },
        project: { findUnique: vi.fn() },
        task: { create: vi.fn(), update: vi.fn() },
    },
}));

const { prisma } = await import("@/src/infra/data/prisma");
const { findInvalidUserIds } = await import("./project-requests.service");
const { canManageProject, createTask, updateTask } = await import("./projects.service");

function makeRequestPayload(overrides = {}) {
    return {
        titulo: "Robô seguidor de linha",
        descricao: "Construção de um robô autônomo para a feira de ciências do campus",
        objetivo: "Ensinar fundamentos de robótica e programação embarcada aos alunos",
        categoria: "EXTENSION" as const,
        ...overrides,
    };
}

describe("createProjectRequestSchema", () => {
    it("aceita uma solicitação completa com integrantes", () => {
        const parsed = createProjectRequestSchema.safeParse(
            makeRequestPayload({
                integrantes: [{ userId: "user_1", papel: "bolsista" }, { userId: "user_2" }],
            })
        );

        expect(parsed.success).toBe(true);
    });

    it("rejeita descrição curta demais", () => {
        expect(createProjectRequestSchema.safeParse(makeRequestPayload({ descricao: "curta" })).success).toBe(false);
    });

    it("rejeita categoria desconhecida", () => {
        expect(createProjectRequestSchema.safeParse(makeRequestPayload({ categoria: "OUTRA" })).success).toBe(false);
    });

    it("rejeita integrante duplicado", () => {
        const parsed = createProjectRequestSchema.safeParse(
            makeRequestPayload({ integrantes: [{ userId: "user_1" }, { userId: "user_1" }] })
        );

        expect(parsed.success).toBe(false);
    });

    it("rejeita campo desconhecido no payload", () => {
        expect(createProjectRequestSchema.safeParse(makeRequestPayload({ orcamento: 500 })).success).toBe(false);
    });
});

describe("patchProjectRequestSchema", () => {
    it("rejeita payload vazio", () => {
        expect(patchProjectRequestSchema.safeParse({}).success).toBe(false);
    });

    it("aceita atualização parcial no reenvio", () => {
        expect(patchProjectRequestSchema.safeParse({ objetivo: "Objetivo revisado conforme o parecer" }).success).toBe(
            true
        );
    });
});

describe("rejectProjectRequestSchema", () => {
    it("exige o motivo da rejeição", () => {
        expect(rejectProjectRequestSchema.safeParse({}).success).toBe(false);
    });

    it("rejeita motivo curto demais", () => {
        expect(rejectProjectRequestSchema.safeParse({ reason: "não" }).success).toBe(false);
    });

    it("aceita motivo e observações", () => {
        const parsed = rejectProjectRequestSchema.safeParse({
            reason: "Objetivos não estão claros o suficiente",
            observacoes: "Detalhe a metodologia",
        });

        expect(parsed.success).toBe(true);
    });
});

describe("approveProjectRequestSchema", () => {
    it("aceita aprovação sem comentário", () => {
        expect(approveProjectRequestSchema.safeParse({}).success).toBe(true);
    });
});

describe("patchProjectSchema", () => {
    it("rejeita data de término anterior à de início", () => {
        const parsed = patchProjectSchema.safeParse({ dataInicio: "2026-10-01", dataFim: "2026-09-01" });

        expect(parsed.success).toBe(false);
    });

    it("aceita mudança de status", () => {
        expect(patchProjectSchema.safeParse({ status: "COMPLETED" }).success).toBe(true);
    });
});

describe("createTaskSchema", () => {
    it("rejeita progresso acima de 100", () => {
        expect(createTaskSchema.safeParse({ titulo: "Montar chassi", progresso: 120 }).success).toBe(false);
    });

    it("aceita tarefa mínima", () => {
        expect(createTaskSchema.safeParse({ titulo: "Montar chassi" }).success).toBe(true);
    });
});

describe("taskStatusSchema", () => {
    it("rejeita status desconhecido", () => {
        expect(taskStatusSchema.safeParse({ status: "PAUSED" }).success).toBe(false);
    });

    it("aceita DONE", () => {
        expect(taskStatusSchema.safeParse({ status: "DONE" }).success).toBe(true);
    });
});

describe("findInvalidUserIds", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("aponta ids sem usuário ativo correspondente", async () => {
        vi.mocked(prisma.user.findMany).mockResolvedValue([{ id: "user_1" }] as never);

        await expect(findInvalidUserIds(["user_1", "fantasma"])).resolves.toEqual(["fantasma"]);
    });

    it("não consulta o banco para lista vazia", async () => {
        await expect(findInvalidUserIds([])).resolves.toEqual([]);
        expect(prisma.user.findMany).not.toHaveBeenCalled();
    });
});

describe("canManageProject", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("libera admin e professor sem consultar o projeto", async () => {
        await expect(canManageProject("proj_1", "user_9", "ADMIN")).resolves.toBe(true);
        await expect(canManageProject("proj_1", "user_9", "PROFESSOR")).resolves.toBe(true);
        expect(prisma.project.findUnique).not.toHaveBeenCalled();
    });

    it("libera o líder do projeto", async () => {
        vi.mocked(prisma.project.findUnique).mockResolvedValue({
            leaderId: "user_1",
            ProjectMember: [],
        } as never);

        await expect(canManageProject("proj_1", "user_1", "VISITOR")).resolves.toBe(true);
    });

    it("libera integrante do projeto", async () => {
        vi.mocked(prisma.project.findUnique).mockResolvedValue({
            leaderId: "outro",
            ProjectMember: [{ id: "pm_1" }],
        } as never);

        await expect(canManageProject("proj_1", "user_2", "VISITOR")).resolves.toBe(true);
    });

    it("bloqueia quem não participa do projeto", async () => {
        vi.mocked(prisma.project.findUnique).mockResolvedValue({
            leaderId: "outro",
            ProjectMember: [],
        } as never);

        await expect(canManageProject("proj_1", "estranho", "VISITOR")).resolves.toBe(false);
    });
});

describe("sincronia entre status e progresso da tarefa", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("marca 100% ao concluir a tarefa", async () => {
        vi.mocked(prisma.task.update).mockResolvedValue({} as never);

        await updateTask("task_1", { status: "DONE" }, 40);

        expect(vi.mocked(prisma.task.update).mock.calls[0][0].data).toMatchObject({
            status: "DONE",
            progress: 100,
        });
    });

    it("zera o progresso ao reabrir uma tarefa concluída", async () => {
        vi.mocked(prisma.task.update).mockResolvedValue({} as never);

        await updateTask("task_1", { status: "TODO" }, 100);

        expect(vi.mocked(prisma.task.update).mock.calls[0][0].data).toMatchObject({
            status: "TODO",
            progress: 0,
        });
    });

    it("respeita o progresso informado explicitamente", async () => {
        vi.mocked(prisma.task.update).mockResolvedValue({} as never);

        await updateTask("task_1", { status: "DONE", progresso: 90 }, 40);

        expect(vi.mocked(prisma.task.update).mock.calls[0][0].data).toMatchObject({ progress: 90 });
    });

    it("cria tarefa concluída já com 100%", async () => {
        vi.mocked(prisma.task.create).mockResolvedValue({} as never);

        await createTask("proj_1", { titulo: "Entregar relatório", status: "DONE" });

        expect(vi.mocked(prisma.task.create).mock.calls[0][0].data).toMatchObject({ progress: 100 });
    });
});
