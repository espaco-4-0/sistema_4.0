"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getTopPosts } from "@/src/infra/modules/blog/blog.service";
import type { BlogPost } from "@/src/infra/modules/blog/blog.types";
import { useIsMobile } from "@/src/ui/hooks/use-mobile";
import { ArrowRight, Newspaper } from "lucide-react";
import { Transition, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

import { EmptyState } from "./empty_state";

const MotionLink = motion.create(Link);

const transitionCards: Transition = {
    type: "spring",
    damping: 35,
    stiffness: 250,
};

type NewsCard = {
    id: string;
    slug: string;
    title: string;
    summary: string;
    category: string;
    imageUrl: string;
};

type LayoutState = {
    featuredId: string;
    smallSlots: string[];
};

const smallSlotClasses = [
    "col-start-1 row-start-3 md:col-start-5 md:row-start-1",
    "col-start-2 row-start-3 md:col-start-6 md:row-start-1",
    "col-start-1 row-start-4 md:col-start-5 md:row-start-2",
    "col-start-2 row-start-4 md:col-start-6 md:row-start-2",
];

const FALLBACK_IMAGE = "fallback-image.png";

function normalizeNews(items: BlogPost[]): NewsCard[] {
    return items
        .map((item) => {
            const id = String(item.id ?? "");
            if (!id) return null;

            return {
                id,
                slug: item.slug?.trim() || id,
                title: item.titulo?.trim() || "Notícia sem título",
                summary: item.resumo?.trim() || "Leia a notícia completa para mais detalhes.",
                category: item.categorias?.[0]?.nome?.trim() || "Geral",
                imageUrl: item.fotos?.[0]?.url?.trim() || FALLBACK_IMAGE,
            };
        })
        .filter((item): item is NewsCard => Boolean(item));
}

function buildInitialLayout(news: NewsCard[]): LayoutState {
    const ids = news.map((n) => n.id);

    if (ids.length === 0) {
        return { featuredId: "", smallSlots: [] };
    }

    return {
        featuredId: ids[0],
        smallSlots: ids.slice(1, 5),
    };
}

export default function Blog() {
    const isMobile = useIsMobile();
    const [news, setNews] = useState<NewsCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [layoutState, setLayoutState] = useState<LayoutState>({ featuredId: "", smallSlots: [] });

    const gridClass = useMemo(() => {
        switch (news.length) {
            case 1:
                return "grid-cols-1 grid-rows-1";
            case 2:
                return "sm:grid-cols-2 sm:grid-rows-1 grid-cols-1 grid-rows-2";
            case 3:
                return "grid-cols-2 md:grid-cols-3 md:grid-rows-2";
            case 4:
                return "grid-cols-2 grid-rows-2";
            case 5:
                return "grid-cols-2 grid-rows-4 md:grid-cols-6 md:grid-rows-2";
            default:
                return "grid-cols-2 grid-rows-4 md:grid-cols-6 md:grid-rows-2";
        }
    }, [news.length]);

    useEffect(() => {
        let isMounted = true;

        const loadNews = async () => {
            try {
                const response = await getTopPosts();
                const rawItems: BlogPost[] = Array.isArray(response) ? response : [];

                const normalized = normalizeNews(rawItems);

                if (!isMounted) return;

                setNews(normalized);
                setLayoutState(buildInitialLayout(normalized));
            } catch {
                if (!isMounted) return;
                setNews([]);
                setLayoutState({ featuredId: "", smallSlots: [] });
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadNews();

        return () => {
            isMounted = false;
        };
    }, []);

    const rotateCards = useCallback(() => {
        setLayoutState((previous) => {
            if (previous.smallSlots.length === 0 || !previous.featuredId) return previous;

            const [s1, s2, s3, s4, ...rest] = previous.smallSlots;

            if (isMobile) {
                const nextSmallSlots = [s3, previous.featuredId, s4, s2, ...rest].filter((id): id is string =>
                    Boolean(id)
                );
                return { featuredId: s1 ?? previous.featuredId, smallSlots: nextSmallSlots };
            }

            const nextSmallSlots = [s2, s4, previous.featuredId, s3, ...rest].filter((id): id is string => Boolean(id));
            return { featuredId: s1 ?? previous.featuredId, smallSlots: nextSmallSlots };
        });
    }, [isMobile]);

    const getCardVariant = useCallback(
        (index: number, id: string): "featured" | "medium" | "small" => {
            if (news.length <= 2) return "featured";
            if (news.length === 3) return index === 0 ? "featured" : "medium";
            if (news.length === 4) return isMobile ? "medium" : "featured";
            return id === layoutState.featuredId ? "featured" : "small";
        },
        [news.length, isMobile, layoutState.featuredId]
    );

    useEffect(() => {
        if (news.length <= 1) return;
        const interval = setInterval(rotateCards, 40000);
        return () => clearInterval(interval);
    }, [news.length, rotateCards]);

    const slotIndexMap = useMemo(
        () => new Map(layoutState.smallSlots.map((id, i) => [id, i])),
        [layoutState.smallSlots]
    );

    if (loading) {
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                        <div className="h-72 md:h-80 rounded-2xl bg-slate-200" />
                        <div className="h-36 md:h-60 rounded-xl bg-slate-200" />
                        <div className="h-36 md:h-60 rounded-xl bg-slate-200" />
                    </div>
                </div>
            </section>
        );
    }

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

                {news.length > 0 ? (
                    <div>
                        <ul className={`grid gap-3 lg:gap-2 px-2 lg:px-4 py-2 lg:py-4 ${gridClass}`}>
                            {news.map((noticia, index) => {
                                const variant = getCardVariant(index, noticia.id);
                                const isFeatured = variant === "featured";
                                const smallIndex = slotIndexMap.get(noticia.id) ?? -1;
                                const smallSlotClass = smallIndex >= 0 ? smallSlotClasses[smallIndex] : "";

                                return (
                                    <motion.li
                                        key={noticia.id}
                                        layout
                                        initial={
                                            isFeatured
                                                ? { opacity: 0.75, x: -25 }
                                                : { opacity: 0.75, y: (index / Math.max(news.length, 1)) * 25 }
                                        }
                                        whileInView={{
                                            opacity: 1,
                                            x: 0,
                                            y: 0,
                                            transition: isFeatured
                                                ? { duration: 0.55, delay: 0.25 }
                                                : { duration: (0.55 * index) / Math.max(news.length, 1), delay: 0.25 },
                                        }}
                                        viewport={{ once: true }}
                                        transition={transitionCards}
                                        className={`group relative overflow-hidden cursor-pointer shadow-lg ${
                                            news.length === 1
                                                ? "col-span-2 row-span-1 h-72 sm:h-80 md:h-125 rounded-2xl md:rounded-3xl"
                                                : news.length === 2
                                                  ? "col-span-1 row-span-1 h-72 sm:h-80 md:h-125 rounded-2xl md:rounded-3xl"
                                                  : news.length === 3
                                                    ? index === 0
                                                        ? "col-span-2 row-span-1 h-72 sm:h-80 md:col-span-2 md:row-span-2 md:h-125 rounded-2xl md:rounded-3xl"
                                                        : "col-span-1 row-span-1 h-44 sm:h-52 md:h-60 rounded-xl"
                                                    : news.length === 4
                                                      ? "col-span-1 row-span-1 h-72 sm:h-80 md:h-96 rounded-xl"
                                                      : isFeatured
                                                        ? "col-span-2 row-span-2 col-start-1 row-start-1 md:col-span-4 md:row-span-2 md:col-start-auto md:row-start-auto h-72 sm:h-80 md:h-125 rounded-2xl md:rounded-3xl md:mr-2"
                                                        : `col-span-1 row-span-1 ${smallSlotClass} h-36 sm:h-44 md:h-60 rounded-xl hover:shadow-xl transition-shadow`
                                        }`}
                                    >
                                        <Link href={`/blog/${noticia.slug}`} className="relative block size-full">
                                            <div className="absolute inset-0 z-10 size-full bg-linear-to-t from-slate-900 via-slate-900/75 to-transparent" />

                                            <Image
                                                src={noticia.imageUrl}
                                                alt={noticia.title}
                                                fill
                                                sizes={
                                                    isFeatured
                                                        ? "(max-width: 768px) 100vw, 66vw"
                                                        : "(max-width: 768px) 50vw, 16vw"
                                                }
                                                className="z-0 object-cover group-hover:scale-110 transition-all duration-700 brightness-80 group-hover:brightness-95"
                                            />

                                            <div
                                                className={`relative size-full z-10 flex flex-col justify-end ${
                                                    variant === "featured"
                                                        ? "gap-4 md:gap-5 p-6 md:p-10 items-start"
                                                        : variant === "medium"
                                                          ? "gap-2 p-4 md:p-6"
                                                          : "gap-1 p-4 md:p-5"
                                                }`}
                                            >
                                                {/* badge de categoria */}
                                                {variant !== "small" && (
                                                    <span className="bg-yellow-primary py-1.5 px-2 sm:px-5 rounded-2xl text-xs font-bold w-fit">
                                                        {noticia.category}
                                                    </span>
                                                )}

                                                <h3
                                                    className={`${
                                                        variant === "featured"
                                                            ? "text-lg md:text-3xl"
                                                            : variant === "medium"
                                                              ? "text-sm md:text-xl"
                                                              : "text-sm md:text-md"
                                                    } text-white font-bold line-clamp-3`}
                                                >
                                                    {noticia.title}
                                                </h3>

                                                <p
                                                    className={`text-white/80 ${
                                                        variant === "featured"
                                                            ? "line-clamp-2 lg:line-clamp-4 text-md"
                                                            : variant === "medium"
                                                              ? "text-xs line-clamp-2"
                                                              : "text-xs line-clamp-3"
                                                    }`}
                                                >
                                                    {noticia.summary}
                                                </p>

                                                {variant === "featured" && (
                                                    <div className="flex font-bold gap-2 text-yellow-primary">
                                                        Ler mais
                                                        <ArrowRight className="group-hover:translate-x-1 transition-transform duration-700" />
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    </motion.li>
                                );
                            })}
                        </ul>

                        <div className="w-full flex justify-center mt-15">
                            <motion.div
                                initial={{ opacity: 0.6, y: 15 }}
                                whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } }}
                                viewport={{ once: true }}
                                transition={{ scale: { duration: 0.2, ease: "easeInOut" } }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
                            >
                                <MotionLink
                                    href="/blog"
                                    initial="rest"
                                    whileHover="hover"
                                    className="border-slate-900 border-2 bg-transparent text-md text-slate-900 font-semibold hover:bg-slate-950 hover:text-slate-50 transition-all rounded-md px-7 py-3.5 flex gap-2 items-center"
                                >
                                    <motion.div
                                        variants={{
                                            rest: { scale: 1, rotate: 0 },
                                            hover: {
                                                scale: [1, 1.15, 1],
                                                rotate: [0, 6, -6, 0],
                                                transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
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
                ) : (
                    <EmptyState
                        title="Nada encontrado por enquanto"
                        description="Quando houver novidades, elas aparecerão aqui"
                    />
                )}
            </div>
        </section>
    );
}
