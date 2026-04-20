"use client";

import { useEffect, useMemo, useState } from "react";
import { getPostBySlug, getPosts } from "@/src/infra/modules/blog/blog.service";
import type { BlogPost } from "@/src/infra/modules/blog/blog.types";
import { ArrowLeft, Bookmark, Calendar, Clock, MessageCircle, Send, Share2, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "../../components/ui/button";
import { Form } from "../../components/ui/form";

const FALLBACK_IMAGE = "/fallback-image.png";

function formatDate(dateValue?: string) {
    if (!dateValue) return "Data não informada";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Data não informada";

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}

function contentToParagraphs(content?: string): string[] {
    if (!content?.trim()) return [];
    const fromLineBreaks = content
        .split(/\r?\n/)
        .map((p) => p.trim())
        .filter(Boolean);

    if (fromLineBreaks.length > 1) return fromLineBreaks;

    return content
        .split(/(?<=\.)\s+/)
        .map((p) => p.trim())
        .filter(Boolean);
}

type RelatedPost = {
    id: string;
    slug: string;
    title: string;
    category: string;
    image: string;
    readingTime: number;
};

function normalizeRelated(posts: BlogPost[]): RelatedPost[] {
    return posts.map((post) => ({
        id: String(post.id),
        slug: post.slug,
        title: post.titulo?.trim() || "Notícia sem título",
        category: post.categorias?.[0]?.nome?.trim() || "Geral",
        image: post.fotos?.[0]?.url?.trim() || FALLBACK_IMAGE,
        readingTime: post.tempoDeLeitura || 5,
    }));
}

export default function BlogMoreInfo() {
    const methods = useForm();
    const params = useParams<{ slug: string }>();
    const router = useRouter();
    const rawSlug = params?.slug;
    const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

    const [news, setNews] = useState<BlogPost | null>(null);
    const [recentNews, setRecentNews] = useState<RelatedPost[]>([]);
    const [loading, setLoading] = useState(true);

    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const [authorName, setAuthorName] = useState("");
    const [comment, setComment] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (!slug?.trim()) {
                if (isMounted) {
                    setNews(null);
                    setRecentNews([]);
                    setLoading(false);
                }
                return;
            }

            try {
                const [post, list] = await Promise.all([getPostBySlug(slug), getPosts({ quantity: 10 })]);

                if (!isMounted) return;

                setNews(post);

                const related = normalizeRelated(
                    (Array.isArray(list) ? list : []).filter((p) => p.slug !== slug)
                ).slice(0, 3);
                setRecentNews(related);
            } catch {
                if (!isMounted) return;
                setNews(null);
                setRecentNews([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [slug]);

    const paragraphs = useMemo(() => contentToParagraphs(news?.conteudo), [news?.conteudo]);
    const lead = paragraphs[0] || news?.resumo || "";
    const bodyParagraphs = paragraphs.length > 1 ? paragraphs.slice(1) : [];

    const handleLike = () => {
        setHasLiked(!hasLiked);
        setLikes((prev) => (hasLiked ? prev - 1 : prev + 1));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-600">Carregando notícia...</p>
            </div>
        );
    }

    if (!news) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl mb-4">Notícia não encontrada</h1>
                    <button
                        onClick={() => router.push("/blog")}
                        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Voltar para Notícias
                    </button>
                </div>
            </div>
        );
    }

    const title = news.titulo?.trim() || "Notícia sem título";
    const image = news.fotos?.[0]?.url?.trim() || FALLBACK_IMAGE;
    const category = news.categorias?.[0]?.nome?.trim() || "Geral";
    const readingTime = news.tempoDeLeitura || 5;

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <button
                    onClick={() => router.push("/blog")}
                    className="flex items-center gap-2 hover:cursor-pointer text-gray-600 hover:text-black mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Voltar</span>
                </button>

                <div className="mb-6">
                    <span className="inline-block px-4 py-2 bg-yellow-400 text-black rounded-full text-sm font-bold">
                        {category}
                    </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">{title}</h1>

                {lead ? <p className="text-xl text-gray-600 mb-8">{lead}</p> : null}

                <div className="flex flex-wrap items-center gap-6 mb-6 text-gray-600">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="font-bold text-black">E</span>
                        </div>
                        <span className="font-medium text-black">Espaço 4.0</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(news.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{readingTime} min</span>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <Button className="flex bg-white text-black items-center gap-2 px-4 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors hover:cursor-pointer">
                            <Share2 className="w-4 h-4" />
                            Compartilhar
                        </Button>

                        <Button
                            onClick={() => setIsSaved(!isSaved)}
                            className={`p-2 border-2 rounded-lg transition-colors hover:cursor-pointer ${
                                isSaved
                                    ? "bg-black text-white hover:bg-black border-black"
                                    : "border-black bg-white text-black hover:bg-gray-100"
                            }`}
                        >
                            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                        </Button>
                    </div>
                </div>

                <div className="mb-12 rounded-2xl overflow-hidden relative h-125">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, 896px"
                        priority
                        className="object-cover"
                    />
                </div>

                <div className="prose prose-lg max-w-none mb-12">
                    {bodyParagraphs.length > 0 ? (
                        bodyParagraphs.map((paragraph, index) => (
                            <div key={`${paragraph}-${index}`} className="mb-6">
                                <p className="text-gray-700 leading-relaxed text-lg">{paragraph}</p>
                            </div>
                        ))
                    ) : (
                        <div className="mb-6">
                            <p className="text-gray-700 leading-relaxed text-lg">{news.conteudo}</p>
                        </div>
                    )}
                </div>

                <div className="border-t-2 border-yellow-400 my-12" />

                <div className="mb-12">
                    <div className="flex items-center gap-6 mb-8">
                        <Button
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all hover:cursor-pointer h-max w-max font-bold ${
                                hasLiked ? "bg-yellow-400 text-black" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <ThumbsUp className={`w-5 h-5 ${hasLiked ? "fill-current" : ""}`} />
                            <span>{likes} Curtidas</span>
                        </Button>

                        <Button className="flex items-center gap-2 px-6 py-3 h-max w-max bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors font-bold">
                            <MessageCircle className="w-5 h-5" />
                            <span>Comentários</span>
                        </Button>
                    </div>

                    <Form {...methods}>
                        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 mb-8">
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Seu nome"
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 bg-white"
                                />
                            </div>

                            <div className="mb-4">
                                <textarea
                                    placeholder="Adicione um comentário..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 min-h-25 resize-y bg-white"
                                />
                            </div>

                            <Button
                                type="button"
                                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-bold hover:cursor-pointer"
                            >
                                <Send className="w-4 h-4" />
                                Enviar Comentário
                            </Button>
                        </div>
                    </Form>

                    <div className="space-y-6">
                        <p className="text-gray-500 text-center">Nenhum comentário. Seja o Primeiro a Comentar!!</p>
                    </div>
                </div>

                <div className="border-t-2 border-yellow-400 my-12" />

                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-black mb-8">Recentemente Publicadas</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentNews.map((article) => (
                            <button
                                key={article.id}
                                onClick={() => {
                                    router.push(`/blog/${article.slug}`);
                                    window.scrollTo(0, 0);
                                }}
                                className="group cursor-pointer bg-white rounded-xl overflow-hidden border hover:shadow-xl transition-all duration-300"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <Image
                                        src={article.image}
                                        alt={article.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>

                                <div className="p-5">
                                    <span className="inline-block px-3 py-1 bg-yellow-400 text-black rounded-full text-xs font-bold mb-3">
                                        {article.category}
                                    </span>
                                    <h3 className="text-base font-bold text-black mb-2 line-clamp-2">
                                        {article.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        {article.readingTime} min
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
