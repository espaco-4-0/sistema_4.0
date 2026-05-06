"use client";

import { useEffect, useMemo, useState } from "react";
import type { BlogPost } from "@/src/infra/modules/blog/blog.types";
import { ChevronLeft, ChevronRight, Clock, Home, Loader2, Search, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "../../components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

import { normalizePostToCard } from "@/src/infra/modules/blog/blog.service";
import { useCategories, usePosts } from "./blog.queries";

export default function BlogNews() {
    const router = useRouter();

    const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
    const [wordFilter, setWordFilter] = useState<string>("");
    const [debouncedWordFilter, setDebouncedWordFilter] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);

    const ITEMS_PER_PAGE = 9;

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedWordFilter(wordFilter);
        }, 400);

        return () => clearTimeout(handler);
    }, [wordFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, debouncedWordFilter]);

    const { data: categoriesData } = useCategories();

    const categories = useMemo(() => {
        const arr = Array.isArray(categoriesData) ? categoriesData : [];
        return ["Todas", ...arr.map((c) => c.nome)];
    }, [categoriesData]);

    const apiFilters: Record<string, any> = { includeArchived: false, page: currentPage, limit: ITEMS_PER_PAGE };
    if (selectedCategory && selectedCategory !== "Todas") apiFilters.category = selectedCategory;
    if (debouncedWordFilter && debouncedWordFilter.trim().length > 0) apiFilters.name = debouncedWordFilter.trim();

    const { data, isLoading, isError, isFetching, isPlaceholderData } = usePosts(apiFilters);

    const posts = useMemo(() => {
        if (!data || !Array.isArray(data.data)) return [];

        const isBackendPaginating = data.meta && data.meta.limit === ITEMS_PER_PAGE;

        if (!isBackendPaginating) {
            const start = (currentPage - 1) * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;
            return data.data.slice(start, end).map(normalizePostToCard);
        }

        return data.data.map(normalizePostToCard);
    }, [data, currentPage]);

    const totalPages = data?.meta?.totalPages || Math.ceil((data?.data?.length || 0) / ITEMS_PER_PAGE) || 1;

    const now = Date.now();

    if (isError) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Erro ao carregar notícias</h2>
                    <p className="text-gray-600 mb-4">Tente novamente mais tarde.</p>
                    <Button onClick={() => router.refresh()}>Recarregar</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <Link
                    href="/"
                    className="mt-5 mb-5 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:cursor-pointer"
                >
                    <Home className="text-gray-300 w-4 h-4" />
                    Voltar para a home page
                </Link>

                <div className="mb-8">
                    <h1 className="text-5xl font-bold text-black mb-3">Todas as Notícias</h1>
                    <p className="text-gray-600 text-lg">
                        Fique por dentro das últimas novidades do mundo da tecnologia
                    </p>
                </div>

                <div className="flex gap-4 mb-8 pb-4 w-full items-center">
                    <div className="flex gap-4 w-full items-center justify-between">
                        <span className="font-medium bg-yellow-primary px-2 py-1 rounded-lg">Filtros:</span>
                        <label className="flex items-center gap-2">
                            <span className="sr-only">Categoria</span>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-60 h-10 py-5 px-3 border border-gray-300 rounded-lg bg-white cursor-pointer">
                                    <SelectValue placeholder="Categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat} className="cursor-pointer">
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </label>
                        <label className="flex items-center gap-2 flex-1 w-full relative">
                            <InputGroup className="max-w-xs h-10 bg-white border-gray-300 rounded-lg w-6/10">
                                <InputGroupInput
                                    value={wordFilter}
                                    onChange={(e) => setWordFilter(e.target.value)}
                                    placeholder="Pesquisar notícias..."
                                />
                                <InputGroupAddon>
                                    {isFetching || wordFilter !== debouncedWordFilter ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
                                    ) : (
                                        <Search className="w-4 h-4" />
                                    )}
                                </InputGroupAddon>
                            </InputGroup>
                        </label>
                    </div>
                </div>

                {isLoading && !data ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="w-10 h-10 animate-spin text-yellow-500 mb-4" />
                        <p className="text-gray-500 font-medium">Carregando notícias...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <p className="text-gray-500 text-sm">
                                Mostrando <span className="font-semibold text-black">{posts.length}</span> notícias na
                                página {currentPage} de {totalPages}
                            </p>
                        </div>

                        {!isLoading && posts.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                                Nenhuma notícia encontrada para estes filtros.
                            </div>
                        ) : (
                            <div
                                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isPlaceholderData ? "opacity-40 pointer-events-none" : "opacity-100"}`}
                            >
                                {posts.map((news, index) => {
                                    return (
                                        <Link
                                            key={news.id}
                                            href={`/blog/${news.slug}`}
                                            className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-yellow-400 hover:shadow-lg transition-all duration-300"
                                        >
                                            <div className="relative h-52 overflow-hidden">
                                                <img
                                                    src={news.image}
                                                    alt={news.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                {index < 3 && (
                                                    <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                                        <TrendingUp className="w-4 h-4" />
                                                        recém publicada
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-5">
                                                <span className="inline-block px-3 py-1 bg-yellow-400 text-black rounded-full text-sm font-bold mb-3">
                                                    {news.category}
                                                </span>

                                                <h2 className="text-lg font-bold text-black mb-3 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                                                    {news.title}
                                                </h2>

                                                <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                                                    {news.excerpt}
                                                </p>

                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span className="font-medium text-gray-700">{news.author}</span>
                                                    <div className="flex items-center gap-3 ml-auto">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {news.readingTime} min
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {!isLoading && posts.length > 0 && (
                    <div className="flex justify-center items-center gap-2 mt-12 mb-8">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 cursor-pointer ${currentPage === 1 && "bg-gray-100"}`}
                        >
                            <ChevronLeft className="w-4 h-4" /> Anterior
                        </Button>

                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }).map((_, i) => {
                                const pageNumber = i + 1;
                                if (
                                    pageNumber === 1 ||
                                    pageNumber === totalPages ||
                                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                ) {
                                    return (
                                        <Button
                                            key={pageNumber}
                                            variant={currentPage === pageNumber ? "default" : "outline"}
                                            onClick={() => setCurrentPage(pageNumber)}
                                            disabled={totalPages <= 1}
                                            className={`w-10 h-10 p-0 cursor-pointer ${currentPage === pageNumber ? "bg-yellow-primary text-black hover:bg-yellow-500 border-none" : ""}`}
                                        >
                                            {pageNumber}
                                        </Button>
                                    );
                                } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                    return (
                                        <span key={pageNumber} className="flex items-end px-1">
                                            ...
                                        </span>
                                    );
                                }
                                return null;
                            })}
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1 cursor-pointer ${currentPage === totalPages && "bg-gray-100"}`}
                        >
                            Próxima <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
