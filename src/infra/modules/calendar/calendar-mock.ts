export type CalendarEventType = "agendado" | "aprovado";

export interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    type: CalendarEventType;
    description: string;
    time: string;
    local: string;
    image?: string;
    whatsapp?: string;
    quantidade?: string | number;
    professor?: string;
}

export const calendarEventsMock: CalendarEvent[] = [
    {
        id: 1,
        title: "Workshop de Impressão 3D",
        start: new Date(2026, 5, 15, 14, 0),
        end: new Date(2026, 5, 15, 16, 0),
        type: "agendado",
        description: "Aprenda os fundamentos e tecnologias da impressão 3D.",
        time: "14:00 - 16:00",
        local: "Espaço 4.0",
        image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80",
        quantidade: "20",
    },
    {
        id: 2,
        title: "Introdução à Robótica Educacional",
        start: new Date(2026, 5, 18, 15, 0),
        end: new Date(2026, 5, 18, 17, 0),
        type: "agendado",
        description: "Explore conceitos básicos de robótica com atividades práticas.",
        time: "15:00 - 17:00",
        local: "Espaço 4.0",
        image: "https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?auto=format&fit=crop&w=1200&q=80",
        quantidade: "15",
    },
    {
        id: 3,
        title: "Curso Básico de Programação",
        start: new Date(2026, 5, 22, 14, 0),
        end: new Date(2026, 5, 22, 16, 0),
        type: "agendado",
        description: "Aprenda lógica de programação e desenvolvimento de software.",
        time: "14:00 - 16:00",
        local: "Espaço 4.0",
        image: "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80",
        quantidade: "20",
    },
    {
        id: 4,
        title: "Oficina de Tecnologia e Criatividade",
        start: new Date(2026, 5, 28, 16, 0),
        end: new Date(2026, 5, 28, 18, 0),
        type: "agendado",
        description: "Desenvolva projetos criativos utilizando tecnologia.",
        time: "16:00 - 18:00",
        local: "Espaço 4.0",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
        quantidade: "25",
    },
];
