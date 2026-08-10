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

export type ApiCourseSchedule = {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    location?: { id: string; name: string } | null;
};

export type ApiCourse = {
    id: string;
    title: string;
    description: string | null;
    workload: number | null;
    capacity?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    createdAt: string;
    professor: {
        fullName: string;
    } | null;
    CourseSchedule?: ApiCourseSchedule[];
    _count?: {
        Enrollment?: number;
    };
};
