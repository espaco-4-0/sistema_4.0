import { CourseDetails } from "@/src/infra/modules/courses/course-mock";
import { Button } from "@/src/ui/components/ui/button";
import { ArrowRight, Calendar, Clock, Users } from "lucide-react";
import Image from "next/image";



interface CourseCardProps extends CourseDetails {
    onAction: () => void;
}

export default function CourseCard({ onAction, ...course }: Readonly<CourseCardProps>) {
    return (
        <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:shadow-xl">
            <div className="absolute top-4 right-4 z-10 rounded-full border border-yellow-100 bg-white/95 px-3 py-1 text-xs font-bold tracking-wider text-yellow-primary uppercase shadow-md backdrop-blur-sm">
                {course.level}
            </div>
            <div className="relative h-48 w-full overflow-hidden sm:h-52">
                <Image
                    src={course.cardImage}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
                <div className="bg-linear-to absolute inset-0 from-black/20 to-transparent" />
            </div>

            <div className="flex grow flex-col p-5">
                <h4 className="mb-2 line-clamp-1 text-xl font-bold text-gray-800">{course.title}</h4>

                <p className="mb-5 line-clamp-2 grow text-sm text-gray-600">{course.description}</p>

                <div className="mb-6 space-y-2.5">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <Clock className="h-4 w-4 shrink-0 text-yellow-icon" />
                        <span>
                            {course.durationWeeks} {course.durationWeeks > 1 ? "semanas" : "semana"}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <Users className="h-4 w-4 shrink-0 text-yellow-icon" />
                        <span>
                            {course.subscribes} {course.subscribes > 1 ? "alunos inscritos" : "aluno inscrito"}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 shrink-0 text-yellow-icon" />
                        <span>
                            Início: <span className="font-medium text-gray-700">{course.startDate}</span>
                        </span>
                    </div>
                </div>
                <Button
                    className="text-md group/btn flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-yellow-secondary py-6 font-semibold text-black transition-colors hover:bg-yellow-secondary-dark"
                    onClick={onAction}
                >
                    Saiba mais
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
            </div>
        </div>
    );
}
