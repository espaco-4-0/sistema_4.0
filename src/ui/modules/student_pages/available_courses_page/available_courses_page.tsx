import { useMemo, useState } from "react";
import { courses } from "@/src/infra/modules/courses/course-mock";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/src/ui/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/src/ui/components/ui/toggle-group";
import { BookOpen, Check, SearchIcon } from "lucide-react";

import CourseCard from "./course_card";

const styleVariants = {
    blue: {
        card: "border-blue-300 bg-blue-50",
        icon: "bg-blue-500 text-white",
        text: "text-blue-700",
    },
    green: {
        card: "border-green-300 bg-green-50",
        icon: "bg-green-500 text-white",
        text: "text-green-700",
    },
    yellow: {
        card: "border-yellow-300 bg-yellow-50",
        icon: "bg-yellow-500 text-white",
        text: "text-yellow-700",
    },
    purple: {
        card: "border-purple-300 bg-purple-50",
        icon: "bg-purple-500 text-white",
        text: "text-purple-700",
    },
} as const;

export default function AvailableCoursesPage() {
    const [search, setSearch] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>(["todos"]);

    const handleCategoryChange = (values: string[]) => {
        if (values.length === 0) {
            setSelectedCategories(["todos"]);
            return;
        }

        if (values.includes("todos") && values.length > 1) {
            setSelectedCategories(values.filter((value) => value !== "todos"));
            return;
        }

        setSelectedCategories(values);
    };

    const visibleCourses = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        return courses.filter((course) => {
            const matchesCategory =
                selectedCategories.includes("todos") || selectedCategories.includes(course.category);

            if (!matchesCategory) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            const haystack = `${course.title} ${course.instructor} ${course.description}`.toLowerCase();
            return haystack.includes(normalizedSearch);
        });
    }, [search, selectedCategories]);

    const visibleCounts = useMemo(() => {
        const categories = new Set(visibleCourses.map((course) => course.category)).size;
        const available = visibleCourses.filter((course) => course.subscribes < course.maxSubscribes).length;
        const activeSubscriptions = visibleCourses.reduce((sum, course) => sum + course.subscribes, 0);

        return {
            total: visibleCourses.length,
            activeSubscriptions,
            available,
            categories,
        };
    }, [visibleCourses]);

    const course_informations = [
        {
            id: 1,
            title: "Total de cursos",
            value: visibleCounts.total,
            icon: BookOpen,
            style: styleVariants.blue,
        },
        {
            id: 2,
            title: "Inscrições ativas",
            value: visibleCounts.activeSubscriptions,
            icon: Check,
            style: styleVariants.green,
        },
        {
            id: 3,
            title: "Disponíveis",
            value: visibleCounts.available,
            icon: BookOpen,
            style: styleVariants.yellow,
        },
        {
            id: 4,
            title: "Categorias",
            value: visibleCounts.categories,
            icon: BookOpen,
            style: styleVariants.purple,
        },
    ];

    return (
        <div className="px-4 pb-6 lg:px-8 lg:pb-8 2xl:px-15 2xl:pb-10 flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 2xl:gap-6">
                {course_informations.map((info) => (
                    <div
                        key={info.id}
                        className={`flex gap-2 lg:gap-3 items-center border p-3 lg:p-4 rounded-lg lg:rounded-xl ${info.style.card}`}
                    >
                        <info.icon
                            className={`flex justify-center items-center size-10 lg:size-12 p-2 lg:p-3 rounded-lg lg:rounded-xl ${info.style.icon}`}
                        />
                        <div>
                            <p className={`text-xs lg:text-sm ${info.style.text}`}>{info.title}</p>
                            <span className={`text-lg lg:text-xl 2xl:text-2xl font-medium ${info.style.text}`}>
                                {info.value}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 lg:mt-6 2xl:mt-8 flex flex-col lg:flex-row gap-3 lg:gap-4 2xl:gap-6">
                <InputGroup className="h-9 lg:h-10 bg-white">
                    <InputGroupInput
                        placeholder="Buscar cursos..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <InputGroupAddon>
                        <SearchIcon className="text-muted-foreground size-4" />
                    </InputGroupAddon>
                </InputGroup>
                <ToggleGroup
                    type="multiple"
                    size="lg"
                    variant="outline"
                    spacing={2}
                    value={selectedCategories}
                    onValueChange={handleCategoryChange}
                    className="flex-wrap lg:flex-nowrap"
                >
                    {["todos", "progamacao", "dados", "design", "marketing"].map((i) => (
                        <ToggleGroupItem
                            key={i}
                            className="bg-white transition-all cursor-pointer text-black! data-[state=on]:text-black! capitalize text-xs lg:text-sm"
                            value={i}
                            aria-label={`Filtrar cursos por ${i}`}
                        >
                            {i === "progamacao" ? "progamação" : i}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 2xl:gap-6 py-4 lg:py-6 2xl:py-7">
                {visibleCourses.map((course) => (
                    <CourseCard key={course.id} {...course} />
                ))}
            </div>
        </div>
    );
}
