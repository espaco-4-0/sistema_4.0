import { useEffect, useState } from "react";
import { BookOpen, Users, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import Image from "next/image";

interface CourseHeroProps {
    title: string;
    description: string;
    level: string;
    instructor: string;
    students: number;
    images: string[];
}

export function CourseHero({ title, description, level, instructor, students, images }: Readonly<CourseHeroProps>) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const SLIDE_DURATION = 5000;

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
            setProgress(0);
        }, SLIDE_DURATION);

        return () => clearTimeout(timer);
    }, [currentImageIndex, images.length, SLIDE_DURATION]);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => Math.min(prev + 1, 100));
        }, SLIDE_DURATION / 100);

        return () => clearInterval(interval);
    }, [currentImageIndex, SLIDE_DURATION]);

    const nextSlide = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
        setProgress(0);
    };

    const prevSlide = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        setProgress(0);
    };

    return (
        <div className="relative h-112.5 overflow-hidden bg-linear-to-r from-yellow-500 to-amber-600 lg:h-105 2xl:h-120">
            <div className="relative h-full">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                            index === currentImageIndex ? "opacity-30" : "opacity-0"
                        }`}
                    >
                        <Image
                            src={image}
                            alt={`Slide ${index + 1}`}
                            className="h-full w-full object-cover"
                            fill
                            priority={index === 0}
                        />
                    </div>
                ))}
                <button
                    onClick={prevSlide}
                    className="absolute top-1/2 left-6 z-10 hidden -translate-y-1/2 cursor-pointer rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition-all hover:bg-white/90 hover:text-yellow-600 lg:block"
                >
                    <ChevronLeft className="size-5" />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute top-1/2 right-6 z-10 hidden -translate-y-1/2 cursor-pointer rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition-all hover:bg-white/90 hover:text-yellow-600 lg:block"
                >
                    <ChevronRightIcon className="size-5" />
                </button>
            </div>

            <div className="absolute inset-0 flex items-center">
                <div className="mx-auto w-full max-w-7xl px-6 lg:px-12">
                    <div className="max-w-2xl 2xl:max-w-3xl">
                        <span className="text-md mb-4 inline-block rounded-full border border-white/30 bg-white/20 px-5 py-1 font-bold text-white shadow-sm backdrop-blur-md">
                            {level}
                        </span>

                        <h1 className="mb-3 text-3xl leading-tight font-bold text-white lg:text-4xl 2xl:text-5xl">
                            {title}
                        </h1>

                        <p className="mb-6 line-clamp-3 text-base text-yellow-50 lg:mb-8 lg:text-lg">{description}</p>

                        <div className="flex flex-wrap gap-6 text-white/90">
                            <div className="flex items-center gap-2">
                                <BookOpen className="size-4 text-yellow-300 lg:size-5" />
                                <span className="text-sm font-medium lg:text-base">{instructor}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Users className="size-4 text-yellow-300 lg:size-5" />
                                <span className="text-sm font-medium lg:text-base">{students} alunos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute right-0 bottom-0 left-0 bg-black/20 px-6 py-3 backdrop-blur-sm">
                <div className="mx-auto flex max-w-7xl items-center gap-4">
                    <div className="flex gap-1.5">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentImageIndex(index);
                                    setProgress(0);
                                }}
                                className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
                                    index === currentImageIndex ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
                                }`}
                            />
                        ))}
                    </div>

                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                            className="h-full bg-yellow-400 transition-all ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <span className="min-w-12.5 text-right font-mono text-xs text-white/80">
                        {currentImageIndex + 1} / {images.length}
                    </span>
                </div>
            </div>
        </div>
    );
}
