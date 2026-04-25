"use client";

import { useMemo, useRef, useState } from "react";
import Loading from "@/src/app/loading";
import NotFound from "@/src/app/not-found";
import { normalizePostToCard } from "@/src/infra/modules/blog/blog.service";
import { ArrowLeft, Calendar, Check, Clock, Share2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { UpvoteIcon, UpvoteIconHandle } from "../../components/ui/upvote";
import BlogComments from "./BlogComments";
import { usePostBySlug, usePosts, useToggleLike } from "./blog.queries";

const FALLBACK_IMAGE = "/fallback-image.png";

function formatDate(dateValue?: Date) {
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

export default function BlogMoreInfo() {
    const params = useParams<{ slug: string }>();
    const router = useRouter();
    const rawSlug = params?.slug;
    const slug = Array.isArray(rawSlug) ? rawSlug[0] : (rawSlug ?? "");

    const { data: session } = useSession();
    const [isCopied, setIsCopied] = useState(false);

    const upvoteIconRef = useRef<UpvoteIconHandle>(null);

    const { data: news, isLoading } = usePostBySlug(slug);
    const { data: listData } = usePosts({ quantity: 10 });
    const { mutate: toggleLike, isPending: isLiking } = useToggleLike();

    const recentNews = useMemo(() => {
        const posts = Array.isArray(listData?.data) ? listData.data : [];
        return posts
            .filter((p) => p.slug !== slug)
            .slice(0, 3)
            .map(normalizePostToCard);
    }, [listData, slug]);

    const paragraphs = useMemo(() => contentToParagraphs(news?.conteudo), [news?.conteudo]);
    const lead = paragraphs[0] || news?.resumo || "";
    const bodyParagraphs = paragraphs.length > 1 ? paragraphs.slice(1) : [];

    const handleLike = () => {
        if (!session) {
            toast.error("Você precisa estar logado para curtir uma notícia", {
                action: {
                    label: "Entrar",
                    onClick: () => router.push("/auth/login"),
                },
            });
            return;
        }

        if (!news) return;

        toggleLike({
            postId: news.id,
            isLiked: news.isLiked,
            slug: news.slug,
        });
    };

    if (isLoading) {
        return <Loading />;
    }

    if (!news) {
        return <NotFound />;
    }

    async function copyLink(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
            toast.success("Link copiado com sucesso para a área de transferência");
        } catch {
            toast.error("Erro ao copiar o link, tente novamente");
        }
    }

    const title = news.titulo?.trim() || "Notícia sem título";
    const image = news.foto?.url?.trim() || FALLBACK_IMAGE;
    const category = news.categoria?.nome?.trim() || "Geral";
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
                            <span className="font-bold text-black uppercase">{news.autor.nomeCompleto[0]}</span>
                        </div>
                        <span className="font-medium text-black">{news.autor.nomeCompleto}</span>
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
                        <Button
                            onClick={() => copyLink(window.location.href)}
                            className={`flex ${isCopied ? "bg-black text-white" : "bg-white text-black"}  items-center gap-2 px-4 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors hover:cursor-pointer`}
                        >
                            {isCopied ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Link copiado
                                </>
                            ) : (
                                <>
                                    <Share2 className="w-4 h-4" />
                                    Compartilhar
                                </>
                            )}
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
                    <div className="flex flex-wrap items-center gap-6 mb-8">
                        <Button
                            onClick={handleLike}
                            onMouseEnter={() => upvoteIconRef.current?.startAnimation()}
                            onMouseLeave={() => upvoteIconRef.current?.stopAnimation()}
                            disabled={isLiking}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all hover:cursor-pointer h-max w-max font-bold ${
                                news.isLiked
                                    ? "bg-yellow-400 text-black shadow-lg scale-105"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <UpvoteIcon
                                ref={upvoteIconRef}
                                size={20}
                                fill={news.isLiked ? "black" : "none"}
                                className={news.isLiked ? "text-black" : "text-gray-700"}
                            />
                            <span>{news.likesCount || 0} Curtidas</span>
                        </Button>

                        <BlogComments postSlug={news.slug} postId={news.id} commentsCount={news.commentsCount} />
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

                                <div className="p-5 text-left">
                                    <span className="inline-block px-3 py-1 bg-yellow-400 text-black rounded-full text-xs font-bold mb-3">
                                        {article.category}
                                    </span>
                                    <h3 className="text-base font-bold text-black mb-2 line-clamp-2">
                                        {article.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock className="w-3.5 h-3.5" />
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
