import { courses } from "@/src/infra/modules/courses/course-mock";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/src/ui/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/src/ui/components/ui/toggle-group";
import { BookOpen, Check, SearchIcon } from "lucide-react";

import CourseCard from "./course_card";

export default function AvailableCoursesPage() {
    const course_informations = [
        {
            id: 1,
            title: "Total de cursos",
            value: 0,
            icon: BookOpen,
            style: {
                card: "border-blue-300 bg-blue-50",
                icon: "bg-blue-500 text-white",
                text: "text-blue-700",
            },
        },
        {
            id: 2,
            title: "Inscrições ativas",
            value: 0,
            icon: Check,
            style: {
                card: "border-green-300 bg-green-50",
                icon: "bg-green-500 text-white",
                text: "text-green-700",
            },
        },
        {
            id: 3,
            title: "Disponíveis",
            value: 0,
            icon: BookOpen,
            style: {
                card: "border-yellow-300 bg-yellow-50",
                icon: "bg-yellow-500 text-white",
                text: "text-yellow-700",
            },
        },
        {
            id: 4,
            title: "Categorias",
            value: 0,
            icon: BookOpen,
            style: {
                card: "border-purple-300 bg-purple-50",
                icon: "bg-purple-500 text-white",
                text: "text-purple-700",
            },
        },
    ];
    return (
        <div className="px-40 py-10 flex flex-col size-full">
            <div className="w-full h-full">
                <h1 className="text-3xl font-semibold mb-3">Cursos Disponíveis</h1>
                <p className="mb-8 text-lg text-gray-500">Explore e inscreva-se nos cursos oferecidos</p>
                <div className="grid grid-cols-4 gap-6 h-24">
                    {course_informations.map((info) => (
                        <div
                            key={info.id}
                            className={`flex gap-3 items-center w-full border p-4 rounded-xl ${info.style.card}`}
                        >
                            <info.icon
                                className={`flex justify-center items-center size-12 p-3 rounded-xl ${info.style.icon}`}
                            />
                            <div>
                                <p className={`text-sm ${info.style.text}`}>{info.title}</p>
                                <span className={` text-2xl font-mediummb-1 text-md ${info.style.text}`}>
                                    {info.value}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 flex gap-6">
                    <InputGroup className="h-10 bg-white">
                        <InputGroupInput placeholder="Buscar cursos..." />
                        <InputGroupAddon>
                            <SearchIcon className="text-muted-foreground" />
                        </InputGroupAddon>
                    </InputGroup>
                    <ToggleGroup type="multiple" size="lg" variant="outline" spacing={2}>
                        <ToggleGroupItem
                            className="bg-white transition-all cursor-pointer text-black! data-[state=on]:text-black!"
                            value="todos"
                            aria-label="Filtrar todos"
                        >
                            Todos
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            className=" bg-white transition-all cursor-pointer text-black! data-[state=on]:text-black!"
                            value="progamacao"
                            aria-label="Filtrar por progamação"
                        >
                            Progamação
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            className=" bg-white transition-all cursor-pointer text-black! data-[state=on]:text-black!"
                            value="dados"
                            aria-label="Filtrar por dados"
                        >
                            Dados
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            className=" bg-white transition-all cursor-pointer text-black! data-[state=on]:text-black!"
                            value="design"
                            aria-label="Filtrar por design"
                        >
                            Design
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            className=" bg-white transition-all cursor-pointer text-black! data-[state=on]:text-black!"
                            value="marketing"
                            aria-label="Filtrar por marketing"
                        >
                            Marketing
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <div className="grid grid-cols-2 gap-6 py-7">
                    {courses.map((course) => (
                        <CourseCard key={course.id} {...course} />
                    ))}
                </div>
            </div>
        </div>
    );
}
