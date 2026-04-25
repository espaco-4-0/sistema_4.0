"use client";

import { useMemo, useRef, useState } from "react";
import type { BlogPost } from "@/src/infra/modules/blog/blog.types";
import { ArrowLeft, Calendar, Check, ChevronLeft, ChevronRight, Clock, Lock, Send, Share2, Trash2, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { Form } from "../../components/ui/form";
import { MessageCircleIcon, MessageCircleIconHandle } from "../../components/ui/message-circle";
import { UpvoteIcon, UpvoteIconHandle } from "../../components/ui/upvote";
import { useDeleteComment, usePostBySlug, usePostComment, usePostComments, usePosts, useToggleLike } from "./blog.queries";

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

type RelatedPost = {
    id: string;
    slug: string;
    title: string;
    category: string;
    image: string;
    readingTime: number;
    authorName: string;
};

function normalizeRelated(posts: BlogPost[]): RelatedPost[] {
    return posts.map((post) => ({
        id: String(post.id),
        slug: post.slug,
        title: post.titulo?.trim() || "Notícia sem título",
        category: post.categoria?.nome?.trim() || "Geral",
        image: post.foto?.url?.trim() || FALLBACK_IMAGE,
        readingTime: post.tempoDeLeitura || 5,
        authorName: post.autor.nomeCompleto || "Espaço 4.0",
    }));
}

export default function BlogMoreInfo() {
    const methods = useForm();
    const params = useParams<{ slug: string }>();
    const router = useRouter();
    const rawSlug = params?.slug;
    const slug = Array.isArray(rawSlug) ? rawSlug[0] : (rawSlug ?? "");

    const { data: session } = useSession();
    const [comment, setComment] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentPage, setCommentPage] = useState(1);

    const upvoteIconRef = useRef<UpvoteIconHandle>(null);
    const messageIconRef = useRef<MessageCircleIconHandle>(null);

    const { data: news, isLoading } = usePostBySlug(slug);
    const { data: listData } = usePosts({ quantity: 10 });
    const { mutate: toggleLike, isPending: isLiking } = useToggleLike();
    const { mutate: postComment, isPending: isPosting } = usePostComment();
    const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment();

    const { data: commentsData, isLoading: isCommentsLoading } = usePostComments(slug, commentPage);

    const recentNews = useMemo(
        () => normalizeRelated((Array.isArray(listData?.data) ? listData.data : []).filter((p) => p.slug !== slug)).slice(0, 3),
        [listData, slug]
    );

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

    const handleCommentSubmit = () => {
        if (!session) {
            toast.error("Você precisa estar logado para comentar", {
                action: {
                    label: "Entrar",
                    onClick: () => router.push("/auth/login"),
                },
            });
            return;
        }

        if (!comment.trim()) {
            toast.error("O comentário não pode estar vazio");
            return;
        }

        if (!news) return;

        postComment({
            postId: news.id,
            comment: comment.trim(),
            slug: news.slug,
        }, {
            onSuccess: () => {
                setComment("");
                setCommentPage(1);
            },
        });
    };

    const handleDeleteComment = (commentId: string) => {
        if (!news) return;

        deleteComment({
            commentId,
            slug: news.slug,
        });
    };

    if (isLoading) {
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
                    <div className="flex items-center gap-6 mb-8">
                        <Button
                            onClick={handleLike}
                            onMouseEnter={() => upvoteIconRef.current?.startAnimation()}
                            onMouseLeave={() => upvoteIconRef.current?.stopAnimation()}
                            disabled={isLiking}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all hover:cursor-pointer h-max w-max font-bold ${
                                news.isLiked ? "bg-yellow-400 text-black shadow-lg scale-105" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <UpvoteIcon ref={upvoteIconRef} size={20} fill={news.isLiked ? "black" : "none"} className={news.isLiked ? "text-black" : "text-gray-700"} />
                            <span>{news.likesCount || 0} Curtidas</span>
                        </Button>

                        <Button
                            onClick={() => setShowComments(!showComments)}
                            onMouseEnter={() => messageIconRef.current?.startAnimation()}
                            onMouseLeave={() => messageIconRef.current?.stopAnimation()}
                            className={`flex items-center gap-2 px-6 py-3 h-max w-max rounded-full transition-all font-bold hover:cursor-pointer ${
                                showComments ? "bg-yellow-primary text-black shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <MessageCircleIcon ref={messageIconRef} size={20} fill={showComments ? "black" : "none"} className={showComments ? "text-black" : "text-gray-700"} />
                            <span>{news.commentsCount || 0} Comentários</span>
                        </Button>
                    </div>

                    {showComments && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                            {session ? (
                                <Form {...methods}>
                                    <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 mb-8">
                                        <div className="mb-4">
                                            <textarea
                                                placeholder="Adicione um comentário..."
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                disabled={isPosting}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 min-h-25 resize-y bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            />
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={handleCommentSubmit}
                                            disabled={isPosting || !comment.trim()}
                                            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-bold hover:cursor-pointer disabled:opacity-50"
                                        >
                                            <Send className="w-4 h-4" />
                                            {isPosting ? "Enviando..." : "Enviar Comentário"}
                                        </Button>
                                    </div>
                                </Form>
                            ) : (
                                <div className="bg-linear-to-br from-yellow-50 to-white rounded-2xl p-8 border-2 border-yellow-200 mb-10 text-center shadow-lg relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Lock className="w-24 h-24 rotate-12" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-yellow-200">
                                            <UserPlus className="w-8 h-8 text-yellow-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Quer participar da conversa?</h3>
                                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                            Apenas usuários cadastrados podem enviar mensagens e interagir com as notícias do Espaço 4.0.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                            <Button
                                                onClick={() => router.push("/auth/register")}
                                                className="px-8 py-6 bg-yellow-400 text-black rounded-xl hover:bg-yellow-500 transition-all font-bold text-lg hover:shadow-lg hover:cursor-pointer w-full sm:w-auto"
                                            >
                                                Cadastrar agora
                                            </Button>
                                            <Button
                                                onClick={() => router.push("/auth/login")}
                                                variant="outline"
                                                className="px-8 py-6 border-2 border-gray-300 rounded-xl hover:border-black transition-all font-bold text-lg hover:cursor-pointer w-full sm:w-auto"
                                            >
                                                Entrar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                {isCommentsLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
                                        <p className="text-gray-500">Carregando comentários...</p>
                                    </div>
                                ) : commentsData?.data && commentsData.data.length > 0 ? (
                                    <>
                                        {commentsData.data.map((c) => (
                                            <div key={c.id} className="bg-white border-2 border-gray-100 rounded-xl p-5 shadow-xs transition-all hover:border-gray-200">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center border border-yellow-200">
                                                            <span className="text-xs font-bold text-yellow-700 uppercase">{c.autor.nomeCompleto[0]}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-black">{c.autor.nomeCompleto}</p>
                                                            <p className="text-xs text-gray-400">{formatDate(c.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                    {(session?.user?.id === c.autor.id || session?.user?.role === "ADMIN") && (
                                                        <button
                                                            onClick={() => handleDeleteComment(c.id)}
                                                            disabled={isDeleting}
                                                            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                                                            title="Excluir comentário"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{c.conteudo}</p>
                                            </div>
                                        ))}

                                        {commentsData.meta.totalPages > 1 && (
                                            <div className="flex justify-center items-center gap-4 pt-6">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setCommentPage((p) => Math.max(1, p - 1))}
                                                    disabled={commentPage === 1}
                                                    className="flex items-center gap-1 hover:cursor-pointer disabled:opacity-30"
                                                >
                                                    <ChevronLeft className="w-4 h-4" /> Anterior
                                                </Button>
                                                <span className="text-sm font-medium text-gray-500">
                                                    Página {commentPage} de {commentsData.meta.totalPages}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setCommentPage((p) => Math.min(commentsData.meta.totalPages, p + 1))}
                                                    disabled={commentPage === commentsData.meta.totalPages}
                                                    className="flex items-center gap-1 hover:cursor-pointer disabled:opacity-30"
                                                >
                                                    Próxima <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-gray-500 text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                        Nenhum comentário ainda. Seja o primeiro a comentar!
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
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
