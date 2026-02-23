import { useEffect, useMemo, useState } from "react";
import { newsData } from "@/src/infra/modules/blog/blog-mock";
import { useIsMobile } from "@/src/ui/hooks/use-mobile";
import { ArrowRight, Newspaper } from "lucide-react";
import { Transition, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

const MotionLink = motion(Link);

const noticias = newsData.slice(0, 5);

const transitionCards: Transition = {
    type: "spring",
    damping: 35,
    stiffness: 250,
};

type LayoutState = {
    featuredId: number;
    smallSlots: number[];
};

const initialLayoutState: LayoutState = {
    featuredId: noticias[0].id,
    smallSlots: noticias.slice(1).map((n) => n.id),
};

const smallSlotClasses = [
    "col-start-1 row-start-3 md:col-start-5 md:row-start-1",
    "col-start-2 row-start-3 md:col-start-6 md:row-start-1",
    "col-start-1 row-start-4 md:col-start-5 md:row-start-2",
    "col-start-2 row-start-4 md:col-start-6 md:row-start-2",
];

export default function Blog() {
    const isMobile = useIsMobile();
    const [layoutState, setLayoutState] = useState(initialLayoutState);

    const rotateCards = () =>
        setLayoutState((previous) => {
            const [topLeft, topRight, bottomLeft, bottomRight] = previous.smallSlots;

            return {
                featuredId: topLeft,
                smallSlots: isMobile
                    ? [bottomLeft, previous.featuredId, bottomRight, topRight]
                    : [topRight, bottomRight, previous.featuredId, bottomLeft],
            };
        });

    useEffect(() => {
        const interval = setInterval(rotateCards, 40000);

        return () => clearInterval(interval);
    }, [isMobile]);

    const slotIndexMap = useMemo(
        () => new Map(layoutState.smallSlots.map((id, i) => [id, i])),
        [layoutState.smallSlots]
    );

    return (
        <section id="blog" className="bg-white py-16 md:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <motion.h2
                    initial={{ opacity: 0.7, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: 0.25 }}
                    className="font-medium text-2xl sm:text-3xl md:text-4xl text-center mb-10 md:mb-17"
                >
                    Novidades do <span className="text-yellow-muted font-bold">Espaço 4.0</span>
                </motion.h2>

                <ul className="grid grid-cols-2 grid-rows-4 gap-3 lg:gap-2 px-2 lg:px-4 py-2 lg:py-4 md:grid-cols-6 md:grid-rows-2">
                    {noticias.map((noticia, index) => {
                        const isFeatured = noticia.id === layoutState.featuredId;
                        const smallIndex = slotIndexMap.get(noticia.id) ?? -1;
                        const smallSlotClass = smallIndex >= 0 ? smallSlotClasses[smallIndex] : "";

                        return (
                            <motion.li
                                key={noticia.id}
                                layout
                                initial={
                                    isFeatured ? { opacity: 0.75, x: -25 } : { opacity: 0.75, y: (index / 4) * 25 }
                                }
                                whileInView={{
                                    opacity: 1,
                                    x: 0,
                                    y: 0,
                                    transition: isFeatured
                                        ? { duration: 0.55, delay: 0.25 }
                                        : { duration: (0.55 * index) / 4, delay: 0.25 },
                                }}
                                viewport={{ once: true }}
                                transition={transitionCards}
                                className={`group relative overflow-hidden cursor-pointer shadow-lg ${
                                    isFeatured
                                        ? "col-span-2 row-span-2 col-start-1 row-start-1 md:col-span-4 md:row-span-2 md:col-start-auto md:row-start-auto h-72 sm:h-80 md:h-125 rounded-2xl md:rounded-3xl md:mr-2"
                                        : `col-span-1 row-span-1 ${smallSlotClass} h-36 sm:h-44 md:h-60 rounded-xl hover:shadow-xl transition-shadow`
                                }`}
                            >
                                <Link href={`/blog/${noticia.id}`}>
                                    <div className="absolute inset-0 z-10 size-full bg-linear-to-t from-slate-900 via-slate-900/75 to-transparent" />

                                    <Image
                                        src={noticia.image}
                                        alt={noticia.title}
                                        fill
                                        className="z-0 object-cover group-hover:scale-110 transition-all duration-700 brightness-80 group-hover:brightness-95"
                                    />

                                    <div
                                        className={`relative size-full z-10 flex flex-col justify-end ${
                                            isFeatured ? "gap-4 md:gap-5 p-6 md:p-10 items-start" : "gap-1 p-4 md:p-5"
                                        }`}
                                    >
                                        {isFeatured ? (
                                            <span className="bg-yellow-primary py-1.5 px-5 rounded-2xl text-xs font-bold">
                                                {noticia.category}
                                            </span>
                                        ) : null}

                                        <h3
                                            className={`${isFeatured ? "text-lg md:text-3xl" : "text-sm md:text-md"} text-white font-bold line-clamp-3`}
                                        >
                                            {noticia.title}
                                        </h3>

                                        <p
                                            className={`${isFeatured ? "line-clamp-2 lg:line-clamp-4 text-white/80 text-md" : "text-white/80 text-xs line-clamp-3"}`}
                                        >
                                            {noticia.about}
                                        </p>

                                        {isFeatured ? (
                                            <div className="flex font-bold gap-2 text-yellow-primary">
                                                Ler mais
                                                <ArrowRight className="group-hover:translate-x-1 transition-transform duration-700" />
                                            </div>
                                        ) : null}
                                    </div>
                                </Link>
                            </motion.li>
                        );
                    })}
                </ul>

                <div className="w-full flex justify-center mt-15">
                    <motion.div
                        initial={{ opacity: 0.6, y: 15 }}
                        whileInView={{
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.5, delay: 0.2 },
                        }}
                        viewport={{ once: true }}
                        transition={{ scale: { duration: 0.2, ease: "easeInOut" } }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{
                            scale: 0.95,
                            transition: { duration: 0.1 },
                        }}
                    >
                        <MotionLink
                            href="/blog"
                            initial="rest"
                            whileHover="hover"
                            className="border-slate-900 border-2 bg-transparent text-md text-slate-900 font-semibold hover:bg-slate-950 hover:text-slate-50 transition-all rounded-md px-7 py-3.5 flex gap-2 items-center"
                        >
                            <motion.div
                                variants={{
                                    rest: {
                                        scale: 1,
                                        rotate: 0,
                                    },
                                    hover: {
                                        scale: [1, 1.15, 1],
                                        rotate: [0, 6, -6, 0],
                                        transition: {
                                            duration: 0.8,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        },
                                    },
                                }}
                            >
                                <Newspaper size={20} />
                            </motion.div>
                            Mais notícias
                        </MotionLink>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
