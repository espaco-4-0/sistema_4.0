import { describe, expect, it } from "vitest";

import { adaptApiCourseToView } from "./courses.service";

describe("adaptApiCourseToView", () => {
    it("maps an API course into the UI shape", () => {
        const course = adaptApiCourseToView({
            id: "course_1",
            titulo: "Curso de SQL",
            descricao: "Aprenda banco de dados na prática",
            cargaHoraria: 24,
            createdAt: "2026-04-07T12:00:00.000Z",
            professor: { nomeCompleto: "Maria Souza" },
            _count: { inscricoes: 7 },
        });

        expect(course.id).toBe("course_1");
        expect(course.title).toBe("Curso de SQL");
        expect(course.instructor).toBe("Maria Souza");
        expect(course.subscribes).toBe(7);
        expect(course.category).toBe("dados");
        expect(course.level).toBe("Intermediario");
        expect(course.topics.length).toBeGreaterThan(0);
    });
});
