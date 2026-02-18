import { useEffect, useState } from "react";
import { images } from "@/src/infra/modules/gallery/gallery_mock";
import { ChevronLeft, ChevronRight, Minimize, X } from "lucide-react";
import Image from "next/image";

export default function SpaceGallery() {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);

    useEffect(() => {
        if (selectedImage === null) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSelectedImage(null);
            }
        };

        globalThis.addEventListener("keydown", handleKeyDown);

        return () => {
            globalThis.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedImage]);

    const navigateImage = (direction: number) => {
        if (selectedImage === null) return;

        const newIndex = (selectedImage + direction + images.length) % images.length;

        setSelectedImage(newIndex);
    };

    return (
        <section id="space_gallery" className="bg-[#F9FAFB] py-20">
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
                            type="button"
                            className="relative overflow-hidden rounded-2xl group cursor-pointer block w-full text-left"
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

                            <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                <div>
                                    <h3 className="text-white font-bold text-xl mb-2">{image.title}</h3>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/95 backdrop-blur-sm"
                        aria-label="Fechar galeria"
                        onClick={() => setSelectedImage(null)}
                    />
                    <button
                        className="absolute top-6 right-6 w-12 h-12 hover:cursor-pointer hover:text-yellow-600 flex items-center hover:transition-all ease-out justify-center text-yellow-500 shadow-lg"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X />
                    </button>

                    <button
                        className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center text-slate-900 shadow-lg"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateImage(-1);
                        }}
                    >
                        <ChevronLeft />
                    </button>

                    <button
                        className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-yellow-muted hover:bg-yellow-500 rounded-full flex items-center justify-center text-slate-900 shadow-lg"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateImage(1);
                        }}
                    >
                        <ChevronRight />
                    </button>

                    <div className="relative max-w-5xl w-full">
                        <Image
                            src={images[selectedImage].src}
                            width={1400}
                            height={1000}
                            alt={images[selectedImage].title}
                            className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                        />
                    </div>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-linear-to-r from-yellow-400 to-orange-500 px-6 py-3 rounded-full shadow-lg">
                        <p className="text-slate-900 font-semibold text-base text-center">
                            {images[selectedImage].title}
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}
