import { useState } from "react";
import { courses } from "@/src/infra/modules/courses/course-mock";
import { Button } from "@/src/ui/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/ui/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Clock4Icon, LoaderCircle, Users } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

import { getHoursOfPeriod } from "../../lib/date";

const CourseDialog = dynamic(() => import("@/src/ui/modules/landing_page/course_dialog"), { ssr: false });
const MotionButton = motion(Button);
const MotionLink = motion(Link);
const MotionCard = motion(Card);

export default function CoursesAndTraining() {
    const [open, setOpen] = useState(false);
    const [cursoSelecionado, setCursoSelecionado] = useState("");
    const [openingCourse, setOpeningCourse] = useState<string | null>(null);

    function abrirDialog(curso: string) {
        if (openingCourse !== null) return;

        setOpeningCourse(curso);
        setCursoSelecionado(curso);

        globalThis.requestAnimationFrame(() => {
            setOpen(true);
            setOpeningCourse(null);
        });
    }

    return (
        <section id="courses" className="bg-white py-28 mx-auto max-w-7xl px-10">
            <div className="text-center">
                <motion.h2
                    initial={{ opacity: 0.7, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: 0.25 }}
                    className="text-4xl font-medium"
                >
                    Cursos <span className="font-bold text-yellow-muted">Abertos</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0.7, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-4 text-gray-600"
                >
                    Aprenda com especialistas e desenvolva habilidades práticas em tecnologia
                </motion.p>
            </div>

            <div className="grid grid-cols-1 gap-8 pt-18 md:grid-cols-2 lg:grid-cols-3">
                {courses.slice(0, 6).map((course, index) => (
                    <MotionCard
                        key={course.id}
                        className="group rounded-2xl border-gray-200 border-[0.5px] shadow-lg transition-all duration-250 hover:shadow-xl p-0"
                        whileHover="hover"
                        layout
                        initial={{ opacity: 0.75, y: 40, x: 5 }}
                        whileInView={{
                            opacity: 1,
                            x: 0,
                            y: 0,
                            transition: { duration: index / 6, delay: 0.15 },
                        }}
                        viewport={{ once: true }}
                    >
                        <CardHeader className="group bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-300 rounded-t-2xl h-20 pb-22 px-6 pt-6">
                            <span className="text-xs font-semibold text-white bg-white/20 border-[0.5px] border-white/10 backdrop-blur-sm w-fit px-3 py-1 mb-1 rounded-xl shadow-xs">
                                {course.level}
                            </span>

                            <CardTitle className="text-xl font-bold text-black">{course.title}</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <p className="text-md text-gray-700">{course.description}</p>

                            <div className="flex justify-between w-7/10 my-2">
                                <div className="mt-4 flex items-center gap-2 text-sm text-black font-medium">
                                    <Clock4Icon className="h-4 w-4 text-yellow-600" />
                                    {getHoursOfPeriod(course.weekDays, course.schedule, course.durationWeeks)} horas
                                </div>

                                <div className="mt-4 flex items-center gap-2 text-sm text-black font-medium">
                                    <Users className="h-4 w-4 text-yellow-600" />
                                    {course.maxSubscribes - course.subscribes} vagas
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="pb-6 pt-6">
                            <MotionButton
                                onClick={() => abrirDialog(course.title)}
                                disabled={openingCourse !== null || openingCourse != null}
                                size="lg"
                                variants={{
                                    rest: { scale: 1 },
                                    hover: { scale: 1.02 },
                                }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ duration: 0.02 }}
                                className="bg-yellow-primary text-black hover:bg-yellow-secondary cursor-pointer text-base w-full py-5.5 font-semibold"
                            >
                                {openingCourse === course.title ? (
                                    <span className="flex items-center gap-2">
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                        Carregando...
                                    </span>
                                ) : (
                                    "Inscrever-se agora"
                                )}
                            </MotionButton>
                        </CardFooter>
                    </MotionCard>
                ))}
            </div>

            <div className="flex justify-center mt-20">
                <MotionLink
                    href="/courses"
                    initial={{ opacity: 0.6, y: 30 }}
                    whileInView={{
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.6, delay: 0.2 },
                    }}
                    viewport={{ once: true }}
                    whileHover="hover"
                    whileTap={{ scale: 0.97 }}
                    variants={{
                        rest: { scale: 1 },
                        hover: { scale: 1.04 },
                    }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex items-center justify-center font-semibold rounded-xl text-sm text-white bg-slate-900 2xl:text-[16px] px-8 py-4 gap-2"
                >
                    Ver todos os Cursos
                    <motion.span
                        variants={{
                            rest: {
                                x: 0,
                                rotate: 0,
                            },
                            hover: {
                                x: [0, 3, 0],
                                rotate: [0, 10, 0],
                                transition: {
                                    duration: 0.6,
                                    repeat: 3,
                                    ease: "easeInOut",
                                },
                            },
                        }}
                        className="inline-flex"
                    >
                        <ArrowRight />
                    </motion.span>
                </MotionLink>
            </div>

            <CourseDialog open={open} setOpen={setOpen} curso={cursoSelecionado} />
        </section>
    );
}
