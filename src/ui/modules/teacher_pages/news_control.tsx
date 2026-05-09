"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Plus,
    Search,
} from "lucide-react";
import { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab } from "@/src/components/animate-ui/components/base/tabs";
import type { BlogPost } from "@/src/infra/modules/blog/blog.types";
import { useNewsList } from "./queries/news.queries";

import { PostModal } from "./components/news/post-modal";
import { ConfirmModal } from "./components/news/confirm-modal";
import { PreviewModal } from "./components/news/preview-modal";
import { CategoryModal } from "./components/news/category-modal";
import { PostList } from "./components/news/post-list";

export function NewsControl() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState("ativos");
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        type: "delete" | "approve" | "reject" | "unpublish";
        post: BlogPost;
    } | null>(null);
    const [postToEdit, setPostToEdit] = useState<BlogPost | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 9;

    useEffect(() => {
        setIsSearching(true);
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setIsSearching(false);
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const { data: newsData, isLoading } = useNewsList({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        published: activeTab === "ativos",
        includeArchived: true,
        name: debouncedSearchTerm
    });

    const { data: allNewsData } = useNewsList({
        includeArchived: true,
        limit: 1000
    });

    if (status === "loading") return null;

    if (!session || session.user.role !== "ADMIN") {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-center mx-6 mt-6">
                <div className="bg-red-50 p-6 rounded-full mb-4">
                    <AlertCircle size={48} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Acesso Restrito</h3>
                <p className="text-gray-500 mt-2 max-w-xs text-sm">
                    Esta página e suas funcionalidades são exclusivas para administradores do sistema.
                </p>
            </div>
        );
    }

    const posts = newsData?.data || [];
    const totalPages = newsData?.meta?.totalPages || 1;
    
    const allPosts = allNewsData?.data || [];
    const activeCount = allPosts.filter((p: BlogPost) => p.publicado).length;
    const pendingCount = allPosts.filter((p: BlogPost) => !p.publicado).length;

    const handleOpenPreview = (post: BlogPost) => {
        setSelectedPost(post);
        setIsPreviewOpen(true);
    };

    const handleOpenEdit = (post: BlogPost | null) => {
        setPostToEdit(post);
        setIsEditModalOpen(true);
    };

    const handleOpenConfirm = (type: "delete" | "approve" | "reject" | "unpublish", post: BlogPost) => {
        setConfirmAction({ type, post });
        setIsConfirmModalOpen(true);
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Controle de Notícias</h2>
                    <p className="text-gray-500 text-sm">Gerencie os posts do blog e aprove novas solicitações.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition shadow-sm text-sm font-semibold cursor-pointer border border-gray-200"
                    >
                        Gerenciar Categorias
                    </button>
                    <button
                        onClick={() => handleOpenEdit(null)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition shadow-sm text-sm font-semibold cursor-pointer"
                    >
                        <Plus size={18} /> Novo Post
                    </button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                    <div className="relative">
                        <TabsList className="grid grid-cols-2 w-full md:w-80 h-10">
                            <TabsTab value="ativos" className="text-xs font-semibold data-selected:text-yellow-900">
                                Ativos ({activeCount})
                            </TabsTab>
                            <TabsTab value="solicitacoes" className="text-xs font-semibold data-selected:text-yellow-900">
                                Solicitações ({pendingCount})
                            </TabsTab>
                        </TabsList>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors">
                            {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por título..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2 bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-xl text-sm transition-all outline-none"
                        />
                    </div>
                </div>

                <TabsPanels>
                    <TabsPanel value="ativos" className="pt-2">
                        <PostList
                            posts={posts}
                            isLoading={isLoading}
                            activeTab="ativos"
                            onPreview={handleOpenPreview}
                            onEdit={handleOpenEdit}
                            onConfirm={handleOpenConfirm}
                        />
                    </TabsPanel>
                    <TabsPanel value="solicitacoes" className="pt-2">
                        <PostList
                            posts={posts}
                            isLoading={isLoading}
                            activeTab="solicitacoes"
                            onPreview={handleOpenPreview}
                            onEdit={handleOpenEdit}
                            onConfirm={handleOpenConfirm}
                        />
                    </TabsPanel>
                </TabsPanels>
            </Tabs>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || isLoading}
                        className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all cursor-pointer ${currentPage === page ? "bg-yellow-400 text-gray-900 shadow-md shadow-yellow-400/20" : "text-gray-500 hover:bg-gray-100"}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || isLoading}
                        className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            <PostModal
                isOpen={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                postToEdit={postToEdit}
            />

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onOpenChange={setIsConfirmModalOpen}
                action={confirmAction}
            />

            <PreviewModal
                isOpen={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                post={selectedPost}
            />

            <CategoryModal
                isOpen={isCategoryModalOpen}
                onOpenChange={setIsCategoryModalOpen}
            />
        </div>
    );
}
