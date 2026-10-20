import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/src/infra/data/prisma", () => ({
    prisma: {
        course: { findUnique: vi.fn() },
        enrollment: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
    },
}));

const { prisma } = await import("@/src/infra/data/prisma");
const { enrollUser, unenrollUser } = await import("./enrollment.service");

const baseCourse = {
    id: "course-1",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    description: null as string | null,
    capacity: 30 as number | null,
    title: "Curso de teste",
    workload: null as number | null,
    startDate: null as Date | null,
    endDate: null as Date | null,
    professorId: "professor-1",
    _count: {
        Enrollment: 0,
    },
};

function makeCourse(overrides: Partial<typeof baseCourse> = {}) {
    return {
        ...baseCourse,
        ...overrides,
    };
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("enrollUser", () => {
    it("curso inexistente → NotFoundError", async () => {
        vi.mocked(prisma.course.findUnique).mockResolvedValue(null);

        await expect(enrollUser("user-1", "curso-x")).rejects.toMatchObject({
            statusCode: 404,
            code: "NOT_FOUND",
        });
    });

    it("curso inativo → ConflictError", async () => {
        vi.mocked(prisma.course.findUnique).mockResolvedValue(makeCourse({ isActive: false }));

        await expect(enrollUser("user-1", "course-1")).rejects.toMatchObject({
            statusCode: 409,
            message: expect.stringContaining("inativo"),
        });
    });

    it("usuario ja inscrito → ConflictError", async () => {
        vi.mocked(prisma.course.findUnique).mockResolvedValue(makeCourse());
        vi.mocked(prisma.enrollment.findUnique).mockResolvedValue({ id: "enroll-1" } as never);

        await expect(enrollUser("user-1", "course-1")).rejects.toMatchObject({
            statusCode: 409,
            message: expect.stringContaining("inscrito"),
        });
    });

    it("curso lotado → ConflictError com capacidade na mensagem", async () => {
        vi.mocked(prisma.course.findUnique).mockResolvedValue(makeCourse({ capacity: 10, _count: { Enrollment: 10 } }));
        vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);

        await expect(enrollUser("user-1", "course-1")).rejects.toMatchObject({
            statusCode: 409,
            message: expect.stringContaining("10"),
        });
    });

    it("capacidade null (turma aberta) → inscreve sem checar vagas", async () => {
        vi.mocked(prisma.course.findUnique).mockResolvedValue(
            makeCourse({ capacity: null, _count: { Enrollment: 9999 } })
        );
        vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);
        vi.mocked(prisma.enrollment.create).mockResolvedValue({ id: "enroll-novo" } as never);

        await expect(enrollUser("user-1", "course-1")).resolves.toMatchObject({ id: "enroll-novo" });
    });

    it("sucesso → chama prisma.enrollment.create com userId e courseId", async () => {
        vi.mocked(prisma.course.findUnique).mockResolvedValue(makeCourse());
        vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);
        vi.mocked(prisma.enrollment.create).mockResolvedValue({ id: "enroll-novo" } as never);

        await enrollUser("user-1", "course-1");

        expect(prisma.enrollment.create).toHaveBeenCalledWith({
            data: { userId: "user-1", courseId: "course-1" },
        });
    });
});

describe("unenrollUser", () => {
    it("inscricao inexistente → NotFoundError", async () => {
        vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);

        await expect(unenrollUser("user-1", "course-1")).rejects.toMatchObject({
            statusCode: 404,
            code: "NOT_FOUND",
        });
    });

    it("sucesso → chama prisma.enrollment.delete com a chave composta", async () => {
        vi.mocked(prisma.enrollment.findUnique).mockResolvedValue({ id: "enroll-1" } as never);
        vi.mocked(prisma.enrollment.delete).mockResolvedValue({ id: "enroll-1" } as never);

        await unenrollUser("user-1", "course-1");

        expect(prisma.enrollment.delete).toHaveBeenCalledWith({
            where: { userId_courseId: { userId: "user-1", courseId: "course-1" } },
        });
    });
});
