"use client";

import { useState } from "react";
import { CourseDetails } from "@/src/infra/modules/courses/courses.types";
import { Badge } from "@/src/ui/components/ui/badge";
import { Button } from "@/src/ui/components/ui/button";
import CourseDialog from "@/src/ui/modules/landing_page/course_dialog";
import { CalendarClock, Clock, Users } from "lucide-react";

export default function CourseCard(course: Readonly<CourseDetails>) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const getLevelColor = (level: string) => {
        switch (level) {
            case "Iniciante":
                return "bg-green-100 text-green-700 border-green-200";
            case "Intermediário":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "Avançado":
                return "bg-purple-100 text-purple-700 border-purple-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="group bg-white rounded-lg lg:rounded-xl border hover:shadow-[0_0_32px_rgba(0,0,0,0.15)] transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-yellow-primary/25">
            <div className="relative h-40 lg:h-44 2xl:h-48 overflow-hidden">
                <img
                    src={course.cardImage}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

                <div className="flex gap-1.5 lg:gap-2 absolute top-3 left-3 lg:top-4 lg:left-4">
                    <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm border-0 capitalize text-xs">
                        {course.category}
                    </Badge>
                    <Badge className={`${getLevelColor(course.level)} text-xs`}>{course.level}</Badge>
                </div>
            </div>

            <div className="p-4 lg:p-5 2xl:p-6">
                <div className="flex items-start justify-between mb-2 lg:mb-3">
                    <div className="flex-1">
                        <h3 className="text-base lg:text-lg mb-1">{course.title}</h3>
                        <p className="text-sm lg:text-base text-muted-foreground mb-1 line-clamp-2">
                            {course.description}
                        </p>
                    </div>
                </div>

                <div className="space-y-1.5 lg:space-y-2 mb-3 lg:mb-4 pb-3 lg:pb-4 border-b">
                    <div className="flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm text-gray-600">
                        <CalendarClock className="size-3.5 lg:size-4 text-blue-500" />
                        <span>{course.durationWeeks} semanas</span>
                    </div>
                    <div className="flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm text-gray-600">
                        <Clock className="size-3.5 lg:size-4 text-green-500" />
                        <span>{course.schedule}</span>
                    </div>
                    <div className="flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm text-gray-600">
                        <Users className="size-3.5 lg:size-4 text-purple-500" />
                        <span>{course.subscribes} alunos matriculados</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5 lg:mb-1">Instrutor</p>
                        <p className="text-sm lg:text-base font-medium truncate">{course.instructor}</p>
                    </div>
                    <Button
                        onClick={() => setDialogOpen(true)}
                        className="cursor-pointer bg-linear-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 shadow-lg shadow-yellow-500/30 text-gray-900 group/btn text-xs lg:text-sm px-3 lg:px-4 h-8 lg:h-9 shrink-0"
                    >
                        Matricular
                    </Button>
                </div>
            </div>

            <CourseDialog open={dialogOpen} setOpen={setDialogOpen} curso={course.title} />
        </div>
    );
}
