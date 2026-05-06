"use client";

import { useState } from "react";
import { MessageCircleIcon, MessageCircleIconHandle } from "@/src/ui/components/ui/message-circle";
import { Button } from "@/src/ui/components/ui/button";
import { Form } from "@/src/ui/components/ui/form";
import { ChevronLeft, ChevronRight, Lock, Send, Trash2, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDeleteComment, usePostComment, usePostComments } from "./blog.queries";
import { useRef } from "react";

type BlogCommentsProps = {
    postSlug: string;
    postId: string;
    commentsCount: number;
};

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

export default function BlogComments({ postSlug, postId, commentsCount }: BlogCommentsProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const methods = useForm();

    const [comment, setComment] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [commentPage, setCommentPage] = useState(1);

    const messageIconRef = useRef<MessageCircleIconHandle>(null);

    const { data: commentsData, isLoading: isCommentsLoading } = usePostComments(postSlug, commentPage);
    const { mutate: postComment, isPending: isPosting } = usePostComment();
    const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment();

    const handleCommentSubmit = () => {
        if (!session) {
            toast.error("Você precisa estar logado para comentar", {
                action: { label: "Entrar", onClick: () => router.push("/auth/login") },
            });
            return;
        }

        if (!comment.trim()) {
            toast.error("O comentário não pode estar vazio");
            return;
        }

        postComment(
            { postId, comment: comment.trim(), slug: postSlug },
            {
                onSuccess: () => {
                    setComment("");
                    setCommentPage(1);
                },
            }
        );
    };

    const handleDeleteComment = (commentId: string) => {
        deleteComment({ commentId, slug: postSlug });
    };

    return (
        <>
            <Button
                onClick={() => setShowComments(!showComments)}
                onMouseEnter={() => messageIconRef.current?.startAnimation()}
                onMouseLeave={() => messageIconRef.current?.stopAnimation()}
                className={`flex items-center gap-2 px-6 py-3 h-max w-max rounded-full transition-all font-bold hover:cursor-pointer ${showComments
                        ? "bg-yellow-primary text-black shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
            >
                <MessageCircleIcon
                    ref={messageIconRef}
                    size={20}
                    fill={showComments ? "black" : "none"}
                    className={showComments ? "text-black" : "text-gray-700"}
                />
                <span>{commentsCount || 0} Comentários</span>
            </Button>

            {showComments && (
                <div className="w-full mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
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
                                    <div
                                        key={c.id}
                                        className="bg-white border-2 border-gray-100 rounded-xl p-5 shadow-xs transition-all hover:border-gray-200"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center border border-yellow-200">
                                                    <span className="text-xs font-bold text-yellow-700 uppercase">
                                                        {c.autor.nomeCompleto[0]}
                                                    </span>
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
                                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                            {c.conteudo}
                                        </p>
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
        </>
    );
}
