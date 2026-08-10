import { ApiCourse, ApiCourseSchedule, CourseCategory, CourseDetails } from "./courses.types";

const categoryImages: Record<CourseCategory, string> = {
    progamacao: "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80",
    dados: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
    design: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80",
    marketing: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
};

function inferCategory(text: string): CourseCategory {
    const normalized = text.toLowerCase();

    if (/(dados|sql|postgres|prisma|analise|bi)/.test(normalized)) return "dados";
    if (/(design|ui|ux|figma|criativ)/.test(normalized)) return "design";
    if (/(marketing|midia|seo|campanh)/.test(normalized)) return "marketing";
    return "progamacao";
}

function inferLevel(cargaHoraria: number): string {
    if (cargaHoraria <= 20) return "Iniciante";
    if (cargaHoraria <= 40) return "Intermediario";
    return "Avancado";
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function buildTopics(category: CourseCategory): CourseDetails["topics"] {
    if (category === "dados") {
        return [
            { id: 1, title: "Fundamentos de dados" },
            { id: 2, title: "Consultas e analise" },
        ];
    }

    if (category === "design") {
        return [
            { id: 1, title: "Conceitos visuais" },
            { id: 2, title: "Prototipacao e fluxos" },
        ];
    }

    if (category === "marketing") {
        return [
            { id: 1, title: "Estrategia digital" },
            { id: 2, title: "Metricas de campanha" },
        ];
    }

    return [
        { id: 1, title: "Logica e pratica" },
        { id: 2, title: "Projeto aplicado" },
    ];
}

const WEEKDAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

/** Agrupa os horários por faixa para não repetir "14:00 - 16:00" em cada dia. */
function buildScheduleLabel(schedule: ApiCourseSchedule[]): string {
    if (schedule.length === 0) return "A definir";

    const ranges = [...new Set(schedule.map((slot) => `${slot.startTime} - ${slot.endTime}`))];
    return ranges.join(" / ");
}

function buildWeekDays(schedule: ApiCourseSchedule[]): string[] {
    if (schedule.length === 0) return ["A definir"];

    const days = [...new Set(schedule.map((slot) => slot.dayOfWeek))].sort((a, b) => a - b);
    return days.map((day) => WEEKDAY_NAMES[day] ?? "A definir");
}

export function adaptApiCourseToView(course: ApiCourse): CourseDetails {
    const textBase = `${course.title} ${course.description ?? ""}`;
    const category = inferCategory(textBase);
    const cargaHoraria = course.workload ?? 16;
    const durationWeeks = Math.max(1, Math.ceil(cargaHoraria / 4));
    const schedule = course.CourseSchedule ?? [];

    // Sem período cadastrado, cai para a data de criação para não exibir vazio.
    const startDate = formatDate(course.startDate ?? course.createdAt);
    const endDate = course.endDate ? formatDate(course.endDate) : startDate;

    const location = schedule.find((slot) => slot.location?.name)?.location?.name ?? "Espaco 4.0";

    return {
        id: course.id,
        title: course.title,
        instructor: course.professor?.fullName ?? "Equipe Espaco 4.0",
        description: course.description ?? "Curso disponivel no Espaco 4.0.",
        longDescription: course.description ?? "Curso disponivel no Espaco 4.0.",
        durationWeeks,
        subscribes: course._count?.Enrollment ?? 0,
        // Sem capacidade definida, tratamos como turma aberta.
        maxSubscribes: course.capacity ?? Number.POSITIVE_INFINITY,
        level: inferLevel(cargaHoraria),
        category,
        startDate,
        endDate,
        weekDays: buildWeekDays(schedule),
        schedule: buildScheduleLabel(schedule),
        location,
        cardImage: categoryImages[category],
        gallery: [
            { id: 1, url: categoryImages[category], alt: course.title },
            {
                id: 2,
                url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
                alt: "Turma em atividade",
            },
        ],
        topics: buildTopics(category),
        requirements: [
            { id: 1, label: "Interesse em aprender" },
            { id: 2, label: "Compromisso com as aulas" },
        ],
    };
}

export async function fetchCourses(): Promise<CourseDetails[]> {
    const response = await fetch("/api/courses?ativo=true", { cache: "no-store" });

    if (!response.ok) {
        throw new Error("Falha ao carregar cursos");
    }

    const payload = (await response.json()) as { data?: ApiCourse[] };
    const courses = Array.isArray(payload.data) ? payload.data : [];

    return courses.map(adaptApiCourseToView);
}
