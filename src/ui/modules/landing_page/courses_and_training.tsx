"use client";

import { useState } from "react";
import { Button } from "@/src/ui/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/ui/components/ui/card";
import CourseDialog from "@/src/ui/modules/landing_page/course_dialog";
import { Bot, Box, Clock4Icon, Cpu, KanbanSquare, Layers, Zap } from "lucide-react";
import Link from "next/link";

export default function CoursesAndTraining() {
    const [open, setOpen] = useState(false);
    const [cursoSelecionado, setCursoSelecionado] = useState("");

    function abrirDialog(curso: string) {
        setCursoSelecionado(curso);
        setOpen(true);
    }

    const courses = [
        {
            id: 1,
            title: "Modelagem e Impressão 3D",
            desc: "Aprenda a criar modelos 3D e utilize impressoras para materializar suas ideias",
            hours: "40 horas",
            icon: Box,
        },
        {
            id: 2,
            title: "Arduino e IoT",
            desc: "Desenvolva projetos de automação e Internet das Coisas com Arduino",
            hours: "60 horas",
            icon: Cpu,
        },
        {
            id: 3,
            title: "Robótica Educacional",
            desc: "Construa e programe robôs utilizando kits educacionais",
            hours: "50 horas",
            icon: Bot,
        },
        {
            id: 4,
            title: "Eletrônica Básica",
            desc: "Fundamentos de eletrônica e montagem de circuitos",
            hours: "45 horas",
            icon: Zap,
        },
        {
            id: 5,
            title: "Prototipagem Rápida",
            desc: "Técnicas para transformar ideias em protótipos funcionais",
            hours: "30 horas",
            icon: Layers,
        },
        {
            id: 6,
            title: "Gestão de Projetos Maker",
            desc: "Metodologias ágeis aplicadas ao desenvolvimento de projetos",
            hours: "20 horas",
            icon: KanbanSquare,
        },
    ];

    return (
        <section id="courses" className="bg-white py-28">
            <div className="mx-auto max-w-7xl px-6">
                <div className="text-center">
                    <h2 className="text-4xl font-medium">
                        Cursos e <span className="font-bold text-yellow-muted">Capacitações</span>
                    </h2>
                    <p className="mt-4 text-gray-600">
                        Desenvolva suas habilidades com nossos cursos práticos em tecnologias da indústria 4.0
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 pt-20 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <Card
                            key={course.id}
                            className="rounded-2xl border border-gray-200 shadow-sm transition hover:shadow-md"
                        >
                            <CardHeader>
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-back-icon">
                                    <course.icon className="h-6 w-6 text-yellow-icon" />
                                </div>

                                <CardTitle className="text-lg font-semibold">{course.title}</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm text-gray-600">{course.desc}</p>

                                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                                    <Clock4Icon className="h-4 w-4" />
                                    {course.hours}
                                </div>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    onClick={() => abrirDialog(course.title)}
                                    className="w-full cursor-pointer rounded-lg bg-yellow-secondary py-2 text-sm font-semibold text-black transition duration-200 ease-in-out hover:bg-yellow-secondary-dark active:bg-yellow-primary-dark"
                                >
                                    INSCREVA-SE
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-center pt-20">
                    <Link
                        href="/courses"
                        className="mt-11 flex h-10 w-60 items-center justify-center rounded-xl border-2 border-black bg-white text-sm text-black hover:bg-black duration-250 hover:text-white 2xl:text-[16px] 2xl:h-12 2xl:w-80 transition-all"
                    >
                        Ver todos os Cursos
                    </Link>
                </div>
            </div>

            <CourseDialog open={open} setOpen={setOpen} curso={cursoSelecionado} />
        </section>
    );
}
