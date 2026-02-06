"use client";

import { useEffect, useState } from "react";
import { newsData } from "@/src/infra/modules/blog/blog-mock";
import { ArrowLeft, Bookmark, Calendar, Clock, MessageCircle, Send, Share2, ThumbsUp } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface Comment {
    id: number;
    author: string;
    text: string;
    date: string;
}

export default function BlogMoreInfo() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;

    const news = newsData.find((n) => n.id === Number(id));

    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (news) {
            const savedLikes = localStorage.getItem(`news-${news.id}-likes`);
            const savedHasLiked = localStorage.getItem(`news-${news.id}-hasLiked`);
            const savedComments = localStorage.getItem(`news-${news.id}-comments`);

            if (savedLikes) setLikes(Number(savedLikes));
            if (savedHasLiked) setHasLiked(savedHasLiked === "true");
            if (savedComments) setComments(JSON.parse(savedComments));
        }
    }, [news]);

    const handleLike = () => {
        if (news) {
            const newLikes = hasLiked ? likes - 1 : likes + 1;
            const newHasLiked = !hasLiked;

            setLikes(newLikes);
            setHasLiked(newHasLiked);

            localStorage.setItem(`news-${news.id}-likes`, String(newLikes));
            localStorage.setItem(`news-${news.id}-hasLiked`, String(newHasLiked));
        }
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();

        if (newComment.trim() && authorName.trim() && news) {
            const comment: Comment = {
                id: Date.now(),
                author: authorName.trim(),
                text: newComment.trim(),
                date: new Date().toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }),
            };

            const updatedComments = [comment, ...comments];
            setComments(updatedComments);
            setNewComment("");

            localStorage.setItem(`news-${news.id}-comments`, JSON.stringify(updatedComments));
        }
    };

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

    const recentNews = newsData.filter((n) => n.id !== news.id).slice(0, 3);

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
                        {news.category}
                    </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">{news.title}</h1>

                <p className="text-xl text-gray-600 mb-8">{news.content[0]}</p>

                <div className="flex flex-wrap items-center gap-6 mb-6 text-gray-600">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="font-bold text-black">{news.author.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-black">{news.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{news.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>8 min</span>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors hover:cursor-pointer">
                            <Share2 className="w-4 h-4 hover:cursor-pointer" />
                            Compartilhar
                        </button>
                        <button
                            onClick={() => setIsSaved(!isSaved)}
                            className={`p-2 border-2 rounded-lg transition-colors ${
                                isSaved ? "bg-black text-white border-black" : "border-black hover:bg-gray-100"
                            }`}
                        >
                            <Bookmark className={`w-4 h-4 hover:cursor-pointer ${isSaved ? "fill-current" : ""}`} />
                        </button>
                    </div>
                </div>

                <div className="mb-12 rounded-2xl overflow-hidden">
                    <img src={news.image} alt={news.title} className="w-full h-125 object-cover" />
                </div>

                <div className="prose prose-lg max-w-none mb-12">
                    {news.content.slice(1).map((paragraph, index) => (
                        <div key={index} className="mb-6">
                            {
								index === 1 && (
                                <h2 className="text-2xl font-bold text-black mb-4">A Evolução da Tecnologia</h2>
                            )}
                            {
								index === 3 && (
                                <h2 className="text-2xl font-bold text-black mb-4">Desafios e Oportunidades</h2>
                            )}
                            {
								index === 4 &&
								<h2 className="text-2xl font-bold text-black mb-4">O Futuro é Agora</h2>
							}
                            <p className="text-gray-700 leading-relaxed text-lg">{paragraph}</p>
                        </div>
                    ))}
                </div>

                <div className="mb-12 p-6 bg-gray-50 rounded-2xl border-2 border-yellow-400">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-black text-2xl font-bold">{news.author.charAt(0)}</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-black mb-2">Sobre {news.author}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Jornalista especializado em tecnologia com mais de 10 anos de experiência cobrindo
                                inovação, inteligência artificial e transformação digital. Colaborador regular do
                                TechNews.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t-2 border-yellow-400 my-12"/>

                <div className="mb-12">
                    <div className="flex items-center gap-6 mb-8">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all font-bold ${
                                hasLiked ? "bg-yellow-400 text-black" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <ThumbsUp className={`w-5 h-5 ${hasLiked ? "fill-current" : ""}`} />
                            <span>{likes} Curtidas</span>
                        </button>

                        <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors font-bold">
                            <MessageCircle className="w-5 h-5" />
                            <span>{comments.length} Comentários</span>
                        </button>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-black">Comentários</h3>

                        <form
                            onSubmit={handleAddComment}
                            className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200"
                        >
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Seu nome"
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 bg-white"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <textarea
                                    placeholder="Adicione um comentário..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 min-h-25 resize-y bg-white"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-bold"
                            >
                                <Send className="w-4 h-4" />
                                Enviar Comentário
                            </button>
                        </form>

                        <div className="space-y-6 mt-8">
                            {comments.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Seja o primeiro a comentar!</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4">
                                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shrink-0">
                                            <span className="font-bold text-black">
                                                {comment.author.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-bold text-black">{comment.author}</span>
                                                <span className="text-sm text-gray-500">{comment.date}</span>
                                            </div>
                                            <p className="text-gray-700">{comment.text}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t-2 border-yellow-400 my-12"></div>

                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-black mb-8">Recentemente Publicadas</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentNews.map((article) => (
                            <button
                                key={article.id}
                                onClick={() => {
                                    router.push(`/blog/${article.id}`);
                                    window.scrollTo(0, 0);
                                }}
                                className="group cursor-pointer bg-white rounded-xl overflow-hidden border hover:shadow-xl transition-all duration-300">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-5">
                                    <span className="inline-block px-3 py-1 bg-yellow-400 text-black rounded-full text-xs font-bold mb-3">
                                        {article.category}
                                    </span>
                                    <h3 className="text-base font-bold text-black mb-2 line-clamp-2 transition-colors">
                                        {article.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock className="w-3 h-3" />5 min
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
