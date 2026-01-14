import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, Users } from "lucide-react";
import Image from "next/image";

interface CourseCardProps {
    tittle: string;
    description: string;
    duration_weeks: number;
    subscribes: number;
    start: string;
    level: string;
    onAction: () => void;
    image: string;
}

export default function CourseCard({
    tittle,
    description,
    duration_weeks,
    subscribes,
    start,
    level,
    onAction,
    image,
}: Readonly<CourseCardProps>) {
    return (
        <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:shadow-xl">
            <div className="absolute top-4 right-4 z-10 rounded-full border border-yellow-100 bg-white/90 px-3 py-1 text-xs font-bold tracking-wider text-yellow-700 uppercase shadow-sm backdrop-blur-sm">
                {level}
            </div>
            <div className="relative h-48 w-full overflow-hidden sm:h-52">
                <Image
                    src={image}
                    alt={tittle}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
                <div className="bg-linear-to absolute inset-0 from-black/20 to-transparent" />
            </div>

            <div className="flex grow flex-col p-5">
                <h4 className="mb-2 line-clamp-1 text-xl font-bold text-gray-800">{tittle}</h4>

                <p className="mb-5 line-clamp-2 grow text-sm text-gray-600">{description}</p>

                <div className="mb-6 space-y-2.5">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <Clock className="h-4 w-4 shrink-0 text-yellow-500" />
                        <span>
                            {duration_weeks} {duration_weeks > 1 ? "semanas" : "semana"}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <Users className="h-4 w-4 shrink-0 text-yellow-500" />
                        <span>
                            {subscribes} {subscribes > 1 ? "alunos inscritos" : "aluno inscrito"}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 shrink-0 text-yellow-500" />
                        <span>
                            Início: <span className="font-medium text-gray-700">{start}</span>
                        </span>
                    </div>
                </div>
                <Button
                    className="text-md group/btn flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-yellow-400 py-6 font-semibold text-white transition-colors hover:bg-yellow-500"
                    onClick={onAction}
                >
                    Saiba mais
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
            </div>
        </div>
    );
}
