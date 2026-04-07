import { useState } from "react";
import { newsData } from "@/src/infra/modules/blog/blog-mock";
import { Clock, Filter, Home, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "../../components/ui/button";

// futuramente iremos implementar o redis, e subistituir por uma api funcional ao invés do mock

export default function BlogNews() {
    const [selectedCategory, setSelectedCategory] = useState("Todas");
    const router = useRouter();

    const categories = [
        "Todas",
        "IOT E AUTOMAÇÃO",
        "Robótica",
        "Sustentabilidade",
        "Inteligência Artificial",
        "Impressão 3D",
    ];

    const filteredNews =
        selectedCategory === "Todas" ? newsData : newsData.filter((news) => news.category === selectedCategory);

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

                <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-4">
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shrink-0">
                        <Filter className="w-5 h-5" />
                    </button>

                    <div className="flex gap-2 flex-wrap">
                        {categories.map((category) => (
                            <Button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-5 py-2 rounded-xl h-max w-max transition-colors whitespace-nowrap font-medium hover:cursor-pointer ${
                                    selectedCategory === category
                                        ? "bg-yellow-400 text-black"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </div>

                <p className="text-gray-600 mb-6">
                    Mostrando <span className="font-semibold">{filteredNews.length}</span> artigos
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNews.map((news, index) => (
                        <button
                            key={news.id}
                            onClick={() => router.push(`/blog/${news.id}`)}
                            className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
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

                                <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{news.content[0]}</p>

                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="font-medium">{news.author}</span>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />5 min
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
