import { useEffect, useMemo, useState } from "react";
import { fetchCourses } from "@/src/infra/modules/courses/courses.service";
import { CourseDetails } from "@/src/infra/modules/courses/courses.types";
import { Book, Calendar, ChevronRight, Clock, Home, LucideIcon, SquareCheck, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import CourseCard from "./course_card";
import CourseForm from "./course_form";
import { CourseHero } from "./course_hero";

type RightInformation = {
    id: number;
    icon: LucideIcon;
    title: string;
    description: string | number;
};

const initialCourseDetails: CourseDetails = {
    id: "",
    title: "",
    instructor: "",
    description: "",
    longDescription: "",
    durationWeeks: 0,
    subscribes: 0,
    maxSubscribes: 0,
    level: "",
    category: "progamacao",
    startDate: "",
    endDate: "",
    weekDays: [],
    schedule: "",
    location: "",
    cardImage: "",
    gallery: [],
    topics: [],
    requirements: [],
};

export default function CoursesMainPage() {
    const [courses, setCourses] = useState<CourseDetails[]>([]);
    const [course, setCourse] = useState<CourseDetails>(initialCourseDetails);
    const [showCourse, setShowCourse] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function loadCourses() {
            try {
                const data = await fetchCourses();
                if (!mounted) return;
                setCourses(data);
                setError(null);
            } catch {
                if (!mounted) return;
                setError("Nao foi possivel carregar os cursos no momento.");
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadCourses();

        return () => {
            mounted = false;
        };
    }, []);

    const rightInformations: RightInformation[] = useMemo(
        () => [
            {
                id: 1,
                icon: Clock,
                title: "Duracao",
                description: `${course.durationWeeks} semana(s)`,
            },
            {
                id: 2,
                icon: Calendar,
                title: "Alunos inscritos",
                description: course.subscribes,
            },
            {
                id: 3,
                icon: Users,
                title: "Instrutor responsavel",
                description: course.instructor,
            },
            {
                id: 4,
                icon: Book,
                title: "Inicio das aulas",
                description: course.startDate,
            },
        ],
        [course]
    );

    return (
        <section className="min-h-screen bg-gray-50 py-7 font-sans">
            <div className="mx-auto w-full">
                <div className="ml-2 flex h-auto min-h-12 flex-wrap items-center gap-1 p-2 px-4 pb-4 text-xs font-medium text-yellow-muted lg:px-20 2xl:px-80">
                    <Link href="/" className="flex items-center gap-1 text-gray-400 hover:underline">
                        <Home className="h-3 w-3" />
                        Home
                    </Link>
                    <ChevronRight size={12} className="text-gray-400" />
                    {showCourse ? (
                        <div className="flex flex-wrap items-center gap-1">
                            <button
                                className="cursor-pointer text-gray-400 hover:underline"
                                onClick={() => setShowCourse(false)}
                            >
                                Cursos do Espaço 4.0
                            </button>
                            <ChevronRight size={12} className="text-gray-400" />
                            <span className="break-all">{course.title}</span>
                        </div>
                    ) : (
                        <span>Cursos do Espaço 4.0</span>
                    )}
                </div>

                {showCourse ? (
                    <div className="w-full">
                        <div className="w-full">
                            <CourseHero
                                title={course.title}
                                description={course.description}
                                level={course.level}
                                instructor={course.instructor}
                                students={course.subscribes}
                                gallery={course.gallery}
                            />
                        </div>

                        <div className="mt-8 flex flex-col justify-center gap-8 px-4 lg:mt-12 lg:flex-row lg:px-20 2xl:px-80">
                            <div className="order-2 w-full lg:order-1 lg:flex-1">
                                <CourseForm
                                    course={course.title}
                                    courseId={course.id}
                                    setCloseCourse={() => setShowCourse(false)}
                                />
                            </div>

                            <div className="order-1 flex w-full flex-col gap-4 lg:order-2 lg:w-96">
                                {rightInformations.map(({ icon: Icon, title, description, id }) => (
                                    <div
                                        key={id}
                                        className="flex h-auto min-h-20 w-full gap-4 rounded-xl bg-white p-5 shadow-lg transition-all hover:shadow-xl"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-yellow-back-icon">
                                            <Icon className="h-6 w-6 text-yellow-icon" />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <span className="text-sm font-semibold text-gray-600">{title}</span>
                                            <span className="text-muted-foreground text-xs">{description}</span>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex w-full flex-col gap-3 rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
                                    <h5 className="font-bold">Sobre o Curso</h5>
                                    <p className="text-sm text-gray-500">{course.longDescription}</p>
                                </div>

                                <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
                                    <h5 className="text-md mb-2 font-bold">O que você vai aprender</h5>
                                    {course.topics.map((topic) => (
                                        <div
                                            key={topic.id}
                                            className="flex w-full items-center gap-2 rounded-xl border border-green-300 bg-green-100 p-3 text-sm text-green-900"
                                        >
                                            <Book className="h-4 w-4 shrink-0" /> {topic.title}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
                                    <h5 className="text-md mb-2 font-bold">Requisitos</h5>
                                    {course.requirements.map((req) => (
                                        <div
                                            key={req.id}
                                            className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-gray-100 p-3 text-sm"
                                        >
                                            <SquareCheck className="h-4 w-4 shrink-0 text-yellow-icon" /> {req.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex min-h-60 flex-col items-center justify-between bg-black px-4 py-10 text-white lg:h-60 lg:flex-row lg:px-20 2xl:px-80">
                            <div className="flex flex-col">
                                <h1 className="text-3xl font-semibold text-yellow-primary lg:text-5xl">
                                    Nossos cursos
                                </h1>
                                <p className="mt-4 max-w-3xl text-lg text-yellow-primary lg:mt-8 lg:text-xl">
                                    Descubra nossos cursos de tecnologia e transforme sua carreira.
                                </p>
                            </div>

                            <Image
                                alt="Logo do Espaço 4.0"
                                src="/espaco-logo.svg"
                                priority
                                className="mt-8 h-40 w-auto lg:mt-0"
                                width={40}
                                height={40}
                            />
                        </div>

                        <div className="mt-10 px-4 lg:px-20 2xl:px-80">
                            {loading && <p className="text-gray-500">Carregando cursos...</p>}
                            {!loading && error && <p className="text-red-600">{error}</p>}
                            {!loading && !error && courses.length === 0 && (
                                <p className="text-gray-500">Nenhum curso disponivel no momento.</p>
                            )}
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2 lg:gap-15 2xl:grid-cols-3">
                                {courses.map((course) => (
                                    <CourseCard
                                        key={course.id}
                                        onAction={() => {
                                            setCourse(course);
                                            setShowCourse(true);
                                        }}
                                        {...course}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
