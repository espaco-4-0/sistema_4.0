import { images } from "@/src/infra/modules/galery/gallery_mock";
import { Minimize } from "lucide-react";
import Image from "next/image";

export default function SpaceGallery() {
    return (
        <section id="space_gallery" className="bg-[#F9FAFB] py-20">
            <div className="mx-auto max-w-7xl px-6">
                <h2 className="text-4xl font-semibold text-center">
                    Galeria do <span className="text-yellow-muted font-semibold">Espaco 4.0</span>
                </h2>
                <p className="mt-5 mb-17 text-xl text-center text-gray-600">
                    Veja momentos Reais de aprendizado, criação e inovação
                </p>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                    {images.map((image, index) => (
                        <div key={`${image.title}-${index}`} className="relative overflow-hidden rounded-2xl">
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
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
