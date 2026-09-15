import { findCourseById, findCourseForEdit } from "@/src/infra/modules/courses/course-admin.service";
import { enrollUser, unenrollUser } from "@/src/infra/modules/courses/enrollment.service";
import { ConflictError, NotFoundError } from "@/src/lib/errors/AppError";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/src/app/api/auth/[...nextauth]/route", () => ({ authOptions: {} }));
vi.mock("@/src/infra/modules/courses/course-admin.service", () => ({
    findCourseById: vi.fn(),
    findCourseForEdit: vi.fn(),
    findInvalidScheduleLocations: vi.fn().mockResolvedValue([]),
    findUserForValidation: vi.fn(),
    listCourses: vi.fn(),
    createCourse: vi.fn(),
    updateCourse: vi.fn(),
    deleteCourse: vi.fn(),
    getCourseDeletionBlockers: vi.fn(),
}));
vi.mock("@/src/infra/modules/courses/enrollment.service", () => ({
    enrollUser: vi.fn(),
    unenrollUser: vi.fn(),
}));
vi.mock("@/src/infra/modules/gamification/rules.service", () => ({
    awardForEvent: vi.fn().mockResolvedValue(null),
}));

const { GET: getById, PATCH, DELETE: deleteById } = await import("@/src/app/api/courses/[id]/route");
const { POST: postSubscribe, DELETE: deleteSubscribe } = await import("@/src/app/api/courses/[id]/subscribe/route");
const { POST: postCourse } = await import("@/src/app/api/courses/route");

type NextRequestInit = ConstructorParameters<typeof NextRequest>[1];

function req(url = "http://localhost/api/courses", init?: NextRequestInit) {
    return new NextRequest(url, init);
}

function params(id: string) {
    return { params: Promise.resolve({ id }) };
}

function session(role = "ADMIN") {
    return { user: { id: "user-1", role } };
}

async function json(res: Response) {
    return res.json();
}

beforeEach(() => {
    vi.clearAllMocks();
});

// ─── GET /api/courses/[id] ───────────────────────────────────────────────────

describe("GET /api/courses/[id]", () => {
    it("curso inexistente → 404 com message e code NOT_FOUND", async () => {
        vi.mocked(findCourseById).mockResolvedValue(null);

        const res = await getById(req(), params("nao-existe"));

        expect(res.status).toBe(404);
        const body = await json(res);
        expect(body).toHaveProperty("message");
        expect(body).toHaveProperty("code", "NOT_FOUND");
    });

    it("curso existente → 200", async () => {
        vi.mocked(findCourseById).mockResolvedValue({ id: "c-1", title: "Curso A" } as never);

        const res = await getById(req(), params("c-1"));
        expect(res.status).toBe(200);
    });
});

// ─── PATCH /api/courses/[id] ─────────────────────────────────────────────────

describe("PATCH /api/courses/[id]", () => {
    it("sem sessao → 401 com code UNAUTHORIZED", async () => {
        vi.mocked(getServerSession).mockResolvedValue(null);

        const res = await PATCH(req("http://localhost", { method: "PATCH", body: "{}" }), params("c-1"));

        expect(res.status).toBe(401);
        expect(await json(res)).toMatchObject({ code: "UNAUTHORIZED" });
    });

    it("role STUDENT → 403 com code FORBIDDEN", async () => {
        vi.mocked(getServerSession).mockResolvedValue(session("STUDENT"));

        const res = await PATCH(req("http://localhost", { method: "PATCH", body: "{}" }), params("c-1"));

        expect(res.status).toBe(403);
        expect(await json(res)).toMatchObject({ code: "FORBIDDEN" });
    });

    it("curso inexistente → 404", async () => {
        vi.mocked(getServerSession).mockResolvedValue(session("ADMIN"));
        vi.mocked(findCourseForEdit).mockResolvedValue(null);

        const r = req("http://localhost", {
            method: "PATCH",
            body: JSON.stringify({ ativo: false }),
            headers: { "content-type": "application/json" },
        });
        const res = await PATCH(r, params("nao-existe"));

        expect(res.status).toBe(404);
    });
});

// ─── DELETE /api/courses/[id] ────────────────────────────────────────────────

describe("DELETE /api/courses/[id]", () => {
    it("sem sessao → 401", async () => {
        vi.mocked(getServerSession).mockResolvedValue(null);

        const res = await deleteById(req(), params("c-1"));
        expect(res.status).toBe(401);
    });

    it("role PROFESSOR → 403", async () => {
        vi.mocked(getServerSession).mockResolvedValue(session("PROFESSOR"));

        const res = await deleteById(req(), params("c-1"));
        expect(res.status).toBe(403);
    });
});

// ─── POST /api/courses/[id]/subscribe ────────────────────────────────────────

describe("POST /api/courses/[id]/subscribe", () => {
    it("sem sessao → 401", async () => {
        vi.mocked(getServerSession).mockResolvedValue(null);

        const res = await postSubscribe(req(), params("c-1"));
        expect(res.status).toBe(401);
    });

    it("conflito de inscricao → 409 com code CONFLICT", async () => {
        vi.mocked(getServerSession).mockResolvedValue(session("STUDENT"));
        vi.mocked(enrollUser).mockRejectedValue(new ConflictError("Você já está inscrito neste curso"));

        const res = await postSubscribe(req(), params("c-1"));

        expect(res.status).toBe(409);
        expect(await json(res)).toMatchObject({ code: "CONFLICT" });
    });

    it("curso lotado → 409", async () => {
        vi.mocked(getServerSession).mockResolvedValue(session("STUDENT"));
        vi.mocked(enrollUser).mockRejectedValue(new ConflictError("vagas esgotadas"));

        const res = await postSubscribe(req(), params("c-1"));
        expect(res.status).toBe(409);
    });

    it("curso inexistente → 404", async () => {
        vi.mocked(getServerSession).mockResolvedValue(session("STUDENT"));
        vi.mocked(enrollUser).mockRejectedValue(new NotFoundError("Curso", "c-1"));

        const res = await postSubscribe(req(), params("c-1"));
        expect(res.status).toBe(404);
    });

    it("sucesso → 201", async () => {
        vi.mocked(getServerSession).mockResolvedValue(session("STUDENT"));
        vi.mocked(enrollUser).mockResolvedValue({ id: "enroll-novo" } as never);

        const res = await postSubscribe(req(), params("c-1"));
        expect(res.status).toBe(201);
    });
});

// ─── DELETE /api/courses/[id]/subscribe ──────────────────────────────────────

describe("DELETE /api/courses/[id]/subscribe", () => {
    it("sem sessao → 401", async () => {
        vi.mocked(getServerSession).mockResolvedValue(null);

        const res = await deleteSubscribe(req(), params("c-1"));
        expect(res.status).toBe(401);
    });

    it("inscricao inexistente → 404", async () => {
        vi.mocked(getServerSession).mockResolvedValue(session("STUDENT"));
        vi.mocked(unenrollUser).mockRejectedValue(new NotFoundError("Inscrição"));

        const res = await deleteSubscribe(req(), params("c-1"));
        expect(res.status).toBe(404);
    });

    it("sucesso → 204 sem body", async () => {
        vi.mocked(getServerSession).mockResolvedValue(session("STUDENT"));
        vi.mocked(unenrollUser).mockResolvedValue(undefined);

        const res = await deleteSubscribe(req(), params("c-1"));
        expect(res.status).toBe(204);
    });
});

// ─── POST /api/courses ───────────────────────────────────────────────────────

describe("POST /api/courses", () => {
    it("sem sessao → 401", async () => {
        vi.mocked(getServerSession).mockResolvedValue(null);

        const res = await postCourse(req("http://localhost", { method: "POST", body: "{}" }));
        expect(res.status).toBe(401);
    });

    it("role STUDENT → 403", async () => {
        vi.mocked(getServerSession).mockResolvedValue(session("STUDENT"));

        const res = await postCourse(req("http://localhost", { method: "POST", body: "{}" }));
        expect(res.status).toBe(403);
    });
});
