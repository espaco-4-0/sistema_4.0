import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSignatureSchema, listIssuancesSchema } from "./certifcates.schema";

vi.mock("@/src/infra/data/prisma", () => ({
    prisma: {
        certificateEmission: { count: vi.fn(), groupBy: vi.fn(), findMany: vi.fn() },
        certificateTemplate: { findMany: vi.fn() },
        certificateSignature: { findUnique: vi.fn(), upsert: vi.fn() },
        enrollment: { findMany: vi.fn() },
    },
}));

const { prisma } = await import("@/src/infra/data/prisma");
const { getCertificateMetrics, listIssuances, saveSignature } = await import("./issuances.service");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mocked = prisma as any;

beforeEach(() => {
    vi.clearAllMocks();
});

describe("getCertificateMetrics", () => {
    it("soma as emissões por tipo do template usado", async () => {
        mocked.certificateEmission.count.mockResolvedValue(12);
        mocked.certificateEmission.groupBy.mockResolvedValue([
            { templateId: "t1", _count: { _all: 7 } },
            { templateId: "t2", _count: { _all: 4 } },
            { templateId: "t3", _count: { _all: 1 } },
        ]);
        mocked.certificateTemplate.findMany.mockResolvedValue([
            { id: "t1", type: "PARTICIPATION" },
            { id: "t2", type: "COMPLETION" },
            { id: "t3", type: "EXCELLENCE" },
        ]);

        const metrics = await getCertificateMetrics();

        expect(metrics).toEqual({
            totalGenerated: 12,
            participationCount: 7,
            completionCount: 4,
            excellenceCount: 1,
        });
        // O somatório por tipo tem de fechar com o total.
        expect(metrics.participationCount + metrics.completionCount + metrics.excellenceCount).toBe(
            metrics.totalGenerated
        );
    });

    it("devolve zeros quando não há emissões", async () => {
        mocked.certificateEmission.count.mockResolvedValue(0);
        mocked.certificateEmission.groupBy.mockResolvedValue([]);
        mocked.certificateTemplate.findMany.mockResolvedValue([]);

        const metrics = await getCertificateMetrics();

        expect(metrics).toEqual({
            totalGenerated: 0,
            participationCount: 0,
            completionCount: 0,
            excellenceCount: 0,
        });
    });

    it("ignora emissões cujo template foi removido", async () => {
        mocked.certificateEmission.count.mockResolvedValue(5);
        mocked.certificateEmission.groupBy.mockResolvedValue([
            { templateId: "t1", _count: { _all: 3 } },
            { templateId: "sumiu", _count: { _all: 2 } },
        ]);
        mocked.certificateTemplate.findMany.mockResolvedValue([{ id: "t1", type: "PARTICIPATION" }]);

        const metrics = await getCertificateMetrics();

        expect(metrics.participationCount).toBe(3);
        expect(metrics.totalGenerated).toBe(5);
    });
});

describe("saveSignature", () => {
    it("faz upsert mantendo uma assinatura por usuário", async () => {
        mocked.certificateSignature.upsert.mockResolvedValue({ id: "s1" });

        await saveSignature("user-1", { responsibleName: "Ana Costa", role: "Coordenadora" }, "https://cdn/a.png");

        const args = mocked.certificateSignature.upsert.mock.calls[0][0];
        expect(args.where).toEqual({ userId: "user-1" });
        expect(args.create.responsibleName).toBe("Ana Costa");
        expect(args.update.signatureImageUrl).toBe("https://cdn/a.png");
    });
});

describe("createSignatureSchema", () => {
    it("rejeita campos obrigatórios ausentes", () => {
        expect(createSignatureSchema.safeParse({}).success).toBe(false);
        expect(createSignatureSchema.safeParse({ responsibleName: "Ana Costa" }).success).toBe(false);
        expect(createSignatureSchema.safeParse({ responsibleName: "Ab", role: "Coord" }).success).toBe(false);
    });

    it("aceita payload completo", () => {
        const parsed = createSignatureSchema.safeParse({ responsibleName: "Ana Costa", role: "Coordenadora" });
        expect(parsed.success).toBe(true);
    });
});

describe("listIssuances", () => {
    const enrollments = [
        { id: "e1", userId: "u1", status: "CONFIRMED", user: { id: "u1", fullName: "Larissa Mendes" }, course: { id: "c1", title: "Robótica" } },
        { id: "e2", userId: "u2", status: "PENDING", user: { id: "u2", fullName: "Pedro Alves" }, course: { id: "c1", title: "Robótica" } },
        { id: "e3", userId: "u3", status: "CONFIRMED", user: { id: "u3", fullName: "Ana Souza" }, course: { id: "c2", title: "Python" } },
    ];

    it("classifica o status a partir da emissão e da matrícula", async () => {
        mocked.enrollment.findMany.mockResolvedValue(enrollments);
        mocked.certificateEmission.findMany.mockResolvedValue([
            { alunoId: "u1", course: "Robótica", templateId: "t1", emittedAt: new Date("2026-01-01") },
        ]);

        const result = await listIssuances({ page: 1, limit: 10 });

        expect(result.data.find((r) => r.id === "e1")?.status).toBe("COMPLETED");
        expect(result.data.find((r) => r.id === "e2")?.status).toBe("PENDING");
        expect(result.data.find((r) => r.id === "e3")?.status).toBe("IN_PROGRESS");
    });

    it("filtra por status e recalcula a paginação", async () => {
        mocked.enrollment.findMany.mockResolvedValue(enrollments);
        mocked.certificateEmission.findMany.mockResolvedValue([]);

        const result = await listIssuances({ page: 1, limit: 10, status: "PENDING" });

        expect(result.data).toHaveLength(1);
        expect(result.pagination.total).toBe(1);
    });

    it("pagina o resultado", async () => {
        mocked.enrollment.findMany.mockResolvedValue(enrollments);
        mocked.certificateEmission.findMany.mockResolvedValue([]);

        const result = await listIssuances({ page: 2, limit: 2 });

        expect(result.data).toHaveLength(1);
        expect(result.pagination).toEqual({ page: 2, limit: 2, total: 3, totalPages: 2 });
    });

    it("busca parcial e sem diferenciar maiúsculas por aluno ou curso", async () => {
        mocked.enrollment.findMany.mockResolvedValue([]);
        mocked.certificateEmission.findMany.mockResolvedValue([]);

        await listIssuances({ page: 1, limit: 10, search: "lariss" });

        const where = mocked.enrollment.findMany.mock.calls[0][0].where;
        expect(where.OR).toEqual([
            { user: { fullName: { contains: "lariss", mode: "insensitive" } } },
            { course: { title: { contains: "lariss", mode: "insensitive" } } },
        ]);
    });
});

describe("listIssuancesSchema", () => {
    it("aplica os defaults de paginação", () => {
        const parsed = listIssuancesSchema.parse({});
        expect(parsed).toMatchObject({ page: 1, limit: 10 });
    });

    it("rejeita status fora do enum e limite acima do teto", () => {
        expect(listIssuancesSchema.safeParse({ status: "QUALQUER" }).success).toBe(false);
        expect(listIssuancesSchema.safeParse({ limit: 500 }).success).toBe(false);
    });
});
