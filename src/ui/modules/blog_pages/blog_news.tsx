"use client";

import { useEffect, useMemo, useState } from "react";
import { getPosts } from "@/src/infra/modules/blog/blog.service";
import type { BlogPost } from "@/src/infra/modules/blog/blog.types";
import { Clock, Filter, Home, Search, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "../../components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "../../components/ui/toggle-group";

type BlogCard = {
    id: string;
    slug: string;
    category: string;
    title: string;
    image: string;
    excerpt: string;
    author: string;
    readingTime: number;
    createdAt: Date;
};

const FALLBACK_IMAGE = "fallback-image.png";

function normalizePostToCard(post: BlogPost): BlogCard {
    return {
        id: String(post.id),
        slug: post.slug,
        category: post.categorias?.[0]?.nome?.trim() || "Geral",
        title: post.titulo?.trim() || "Notícia sem título",
        image: post.fotos?.[0]?.url?.trim() || FALLBACK_IMAGE,
        excerpt: post.resumo?.trim() || post.conteudo?.slice(0, 140) || "Leia a notícia completa para mais detalhes.",
        author: post.autor.nomeCompleto || "Espaço 4.0",
        readingTime: post.tempoDeLeitura || 5,
        createdAt: post.createdAt,
    };
}

function filterTextByString(title: string, excerpt: string, expectedString: string) {
    if (
        title.toLowerCase().includes(expectedString) ||
        excerpt.toLowerCase().includes(expectedString.trim().toLowerCase())
    )
        return true;
    return false;
}

export default function BlogNews() {
    const [wordFilter, setWordFilter] = useState("");
    const [viewFilters, setViewFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(["Todas"]);
    const [posts, setPosts] = useState<BlogCard[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        const loadPosts = async () => {
            try {
                const data = await getPosts({ includeArchived: false });
                if (!isMounted) return;

                const normalized = (Array.isArray(data) ? data : []).map(normalizePostToCard);
                setPosts(normalized);
            } catch {
                if (!isMounted) return;
                setPosts([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadPosts();

        return () => {
            isMounted = false;
        };
    }, []);

    const categories = useMemo(() => {
        const dynamic = Array.from(new Set(posts.map((p) => p.category).filter(Boolean)));
        return ["Todas", ...dynamic];
    }, [posts]);

    const filteredNews = useMemo(
        () =>
            (selectedCategory.includes("Todas")
                ? posts
                : posts.filter((news) => selectedCategory.includes(news.category))
            ).filter((news) => filterTextByString(news.title, news.excerpt, wordFilter)),
        [posts, selectedCategory, wordFilter]
    );

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <Link
                    href="/"
                    className="mt-5 mb-5 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:cursor-pointer "
                >
                    <Home className="text-gray-300 w-4 h-4 " />
                    Voltar para a home page
                </Link>

                <div className="mb-8">
                    <h1 className="text-5xl font-bold text-black mb-3">Todas as Notícias</h1>
                    <p className="text-gray-600 text-lg">
                        Fique por dentro das últimas novidades do mundo da tecnologia
                    </p>
                </div>

                <div className="flex items-center gap-4 mb-8 pb-4">
                    <Button
                        variant="ghost"
                        className={`cursor-pointer p-2 border rounded-lg transition-colors shrink-0 ${viewFilters ? "hover:bg-yellow-secondary bg-yellow-primary text-black border-black" : "hover:bg-gray-50 border-gray-300"}`}
                        onClick={() => setViewFilters(!viewFilters)}
                    >
                        <Filter className="w-5 h-5" />
                    </Button>
                    {viewFilters && (
                        <div className="flex w-full justify-between">
                            <ToggleGroup
                                variant="default"
                                type="multiple"
                                className="gap-4"
                                value={selectedCategory}
                                onValueChange={(value: string[]) => {
                                    const getAllOrFilters = value.includes("Todas")
                                        ? value.length === 2
                                            ? [value[value.length - 1]]
                                            : ["Todas"]
                                        : value;
                                    setSelectedCategory(getAllOrFilters);
                                }}
                            >
                                {categories.map((category) => (
                                    <ToggleGroupItem
                                        key={category}
                                        value={category}
                                        aria-label={`Filtrar por ${category}`}
                                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg! h-10 data-[state=on]:text-black cursor-pointer transition-all"
                                    >
                                        {category}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                            <InputGroup className="max-w-xs h-10">
                                <InputGroupInput
                                    value={wordFilter}
                                    onChange={(e) => setWordFilter(e.target.value)}
                                    placeholder="Digite..."
                                />
                                <InputGroupAddon>
                                    <Search />
                                </InputGroupAddon>
                                <InputGroupAddon align="inline-end">{filteredNews.length} resultados</InputGroupAddon>
                            </InputGroup>
                        </div>
                    )}
                </div>

                {loading ? (
                    <p className="text-gray-600 mb-6">Carregando notícias...</p>
                ) : (
                    <p className="text-gray-600 mb-6">
                        Mostrando <span className="font-semibold">{filteredNews.length}</span> artigos
                    </p>
                )}

                {!loading && filteredNews.length === 0 ? (
                    <div className="py-16 text-center text-gray-500">Nenhuma notícia encontrada.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNews.map((news, index) => {
                            const createdAt = new Date(news.createdAt).getTime();

                            const isRecent = Date.now() - createdAt < 7 * 24 * 60 * 60 * 1000;

                            return (
                                <Link
                                    key={news.id}
                                    href={`/blog/${news.slug}`}
                                    className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="relative h-52 overflow-hidden">
                                        <Image
                                            src={news.image}
                                            alt={news.title}
                                            width={500}
                                            height={500}
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            className="w-full h-full object-cover"
                                        />
                                        {isRecent && (
                                            <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                                <TrendingUp className="w-4 h-4" />
                                                recém publicada
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 text-left">
                                        <span className="inline-block px-3 py-1 bg-yellow-400 text-black rounded-full text-sm font-bold mb-3">
                                            {news.category}
                                        </span>

                                        <h2 className="text-lg font-bold text-black mb-3 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                                            {news.title}
                                        </h2>

                                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{news.excerpt}</p>

                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span className="font-medium">{news.author}</span>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {news.readingTime} min
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
