export type CourseCategory = "progamacao" | "dados" | "design" | "marketing";

export type CourseDetails = {
    id: string;
    title: string;
    instructor: string;
    description: string;
    longDescription: string;
    durationWeeks: number;
    subscribes: number;
    maxSubscribes: number;
    level: string;
    category: CourseCategory;
    startDate: string;
    endDate: string;
    weekDays: string[];
    schedule: string;
    location: string;
    cardImage: string;
    gallery: {
        id: number;
        url: string;
        alt?: string;
    }[];
    topics: {
        id: number;
        title: string;
    }[];
    requirements: {
        id: number;
        label: string;
    }[];
};

export type ApiCourse = {
    id: string;
    title: string;
    description: string | null;
    workload: number | null;
    createdAt: string;
    professor: {
        fullName: string;
    } | null;
    _count?: {
        Enrollment?: number;
    };
};
