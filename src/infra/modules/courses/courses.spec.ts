import { describe, expect, it } from "vitest";

import { adaptApiCourseToView } from "./courses.service";

describe("adaptApiCourseToView", () => {
    it("maps an API course into the UI shape", () => {
        const course = adaptApiCourseToView({
            id: "course_1",
            title: "Curso de SQL",
            description: "Aprenda banco de dados na prática",
            workload: 24,
            createdAt: "2026-04-07T12:00:00.000Z",
            professor: { fullName: "Maria Souza" },
            _count: { Enrollment: 7 },
        });

        expect(course.id).toBe("course_1");
        expect(course.title).toBe("Curso de SQL");
        expect(course.instructor).toBe("Maria Souza");
        expect(course.subscribes).toBe(7);
        expect(course.category).toBe("dados");
        expect(course.level).toBe("Intermediario");
        expect(course.topics.length).toBeGreaterThan(0);
    });

    it("uses the real schedule instead of the placeholder", () => {
        const course = adaptApiCourseToView({
            id: "course_2",
            title: "Robótica",
            description: null,
            workload: 40,
            createdAt: "2026-04-07T12:00:00.000Z",
            startDate: "2026-08-01T00:00:00.000Z",
            endDate: "2026-11-30T00:00:00.000Z",
            professor: null,
            CourseSchedule: [
                { dayOfWeek: 2, startTime: "14:00", endTime: "16:00", location: { id: "l1", name: "Lab 1" } },
                { dayOfWeek: 4, startTime: "14:00", endTime: "16:00", location: null },
            ],
        });

        expect(course.weekDays).toEqual(["Terça", "Quinta"]);
        // Faixas iguais não devem se repetir no rótulo.
        expect(course.schedule).toBe("14:00 - 16:00");
        expect(course.location).toBe("Lab 1");
        expect(course.startDate).not.toBe(course.endDate);
    });

    it("falls back to 'A definir' when the course has no schedule", () => {
        const course = adaptApiCourseToView({
            id: "course_3",
            title: "Sem agenda",
            description: null,
            workload: null,
            createdAt: "2026-04-07T12:00:00.000Z",
            professor: null,
            CourseSchedule: [],
        });

        expect(course.weekDays).toEqual(["A definir"]);
        expect(course.schedule).toBe("A definir");
    });

    it("reports capacity so the card can show remaining seats", () => {
        const limitado = adaptApiCourseToView({
            id: "course_4",
            title: "Turma limitada",
            description: null,
            workload: null,
            capacity: 20,
            createdAt: "2026-04-07T12:00:00.000Z",
            professor: null,
            _count: { Enrollment: 8 },
        });

        expect(limitado.maxSubscribes).toBe(20);
        expect(limitado.maxSubscribes - limitado.subscribes).toBe(12);

        const semLimite = adaptApiCourseToView({
            id: "course_5",
            title: "Turma aberta",
            description: null,
            workload: null,
            capacity: null,
            createdAt: "2026-04-07T12:00:00.000Z",
            professor: null,
            _count: { Enrollment: 3 },
        });

        expect(Number.isFinite(semLimite.maxSubscribes)).toBe(false);
    });
});
