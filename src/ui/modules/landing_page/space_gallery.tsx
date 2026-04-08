import { useEffect, useState } from "react";
import { images } from "@/src/infra/modules/gallery/gallery_mock";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Minimize, X } from "lucide-react";
import Image from "next/image";

import { Button } from "../../components/ui/button";

export default function SpaceGallery() {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        if (selectedImage === null) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setSelectedImage(null);
            if (event.key === "ArrowLeft") navigateImage(-1);
            if (event.key === "ArrowRight") navigateImage(1);
        };

        globalThis.addEventListener("keydown", handleKeyDown);

        return () => {
            globalThis.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedImage]);

    const navigateImage = (dir: number) => {
        if (selectedImage === null) return;
        setDirection(dir);
        const newIndex = (selectedImage + dir + images.length) % images.length;
        setSelectedImage(newIndex);
    };

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? "60%" : "-60%", opacity: 0, scale: 0.96 }),
        center: { x: 0, opacity: 1, scale: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? "-60%" : "60%", opacity: 0, scale: 0.96 }),
    };

    return (
        <section id="gallery" className="bg-[#F9FAFB] py-20">
            <div className="mx-auto max-w-7xl px-6">
                <h2 className="text-4xl font-semibold text-center">
                    Galeria do <span className="text-yellow-muted font-semibold">Espaco 4.0</span>
                </h2>
                <p className="mt-5 mb-17 text-xl text-center text-gray-600">
                    Veja Momentos Reais de aprendizado, criação e inovação
                </p>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                    {images.map((image, index) => (
                        <button
                            key={`${image.title}-${index}`}
                            className="relative overflow-hidden rounded-2xl  group cursor-pointer block w-full text-left"
                            onClick={() => setSelectedImage(index)}
                            aria-label={`Abrir imagem: ${image.title}`}
                        >
                            <Image
                                src={image.src}
                                width={1024}
                                height={980}
                                alt={image.title}
                                className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                            />

                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                <div>
                                    <h3 className="bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-bold text-xl mb-2">
                                        {image.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-white/80 text-sm">
                                        <span>Ver em tela cheia</span>
                                        <Minimize />
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {selectedImage !== null && (
                <div className="fixed inset-0 z-25 flex items-center justify-center ">
                    <button
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        aria-label="Fechar galeria"
                        onClick={() => setSelectedImage(null)}
                    />
                    <Button
                        variant="ghost"
                        size="icon-lg"
                        aria-label="Fechar galeria"
                        className="group absolute top-4 right-4 z-10 rounded-full text-yellow-primary transition-all duration-300 ease-out hover:scale-110 hover:bg-yellow-primary/10 hover:text-yellow-muted active:scale-95 md:top-6 md:right-6 hover:cursor-pointer"
                        onClick={() => setSelectedImage(null)}
                    >
                        <span className="inline-flex transition-transform duration-500 ease-out group-hover:rotate-360">
                            <X className="size-5 md:size-6" />
                        </span>
                    </Button>

                    <Button
                        variant="default"
                        size="icon-lg"
                        aria-label="Imagem anterior"
                        className="group absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-linear-to-br from-yellow-primary to-yellow-icon text-slate-900 shadow-md transition-all duration-300 ease-out hover:scale-110 hover:from-yellow-muted hover:to-yellow-icon-dark hover:text-white hover:shadow-xl active:scale-95 md:left-6 md:size-12 hover:cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateImage(-1);
                        }}
                    >
                        <span className="inline-flex transition-transform duration-500 ease-out group-hover:rotate-360">
                            <ChevronLeft className="size-5 md:size-6" />
                        </span>
                    </Button>

                    <Button
                        variant="default"
                        size="icon-lg"
                        aria-label="Próxima imagem"
                        className="group absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-linear-to-bl from-yellow-primary to-yellow-icon text-slate-900 shadow-md transition-all duration-300 ease-out hover:scale-110 hover:from-yellow-muted hover:to-yellow-icon-dark hover:text-white hover:shadow-xl active:scale-95 md:right-6 md:size-12 hover:cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateImage(1);
                        }}
                    >
                        <span className="inline-flex transition-transform duration-500 ease-out group-hover:rotate-360">
                            <ChevronRight className="size-5 md:size-6" />
                        </span>
                    </Button>

                    <div className="relative max-w-5xl w-full overflow-hidden">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={images[selectedImage].src}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                            >
                                <Image
                                    src={images[selectedImage].src}
                                    width={1400}
                                    height={1000}
                                    alt={images[selectedImage].title}
                                    className="w-full h-auto max-h-[80vh] object-cover rounded-2xl shadow-2xl"
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-linear-to-r hover:cursor-pointer from-yellow-400 to-orange-500 px-6 py-3 rounded-xl shadow-lg">
                        <p className="text-slate-900 font-semibold text-base text-center">
                            {images[selectedImage].title}
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}
