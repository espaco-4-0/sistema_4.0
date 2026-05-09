"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab } from "@/src/components/animate-ui/components/base/tabs";
import { GalleryItem } from "@/src/generated/prisma/browser";
import { motion } from "framer-motion";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Newspaper, Plus, Search } from "lucide-react";
import { useSession } from "next-auth/react";

import { GalleryDeleteModal } from "./components/gallery/delete-modal";
import { GalleryEditModal } from "./components/gallery/edit-modal";
import { GalleryEmptyState } from "./components/gallery/empty-state";
import { GalleryCard } from "./components/gallery/gallery-card";
import { GalleryImportModal } from "./components/gallery/import-modal";
import { GalleryUploadModal } from "./components/gallery/upload-modal";
import { useGallery } from "./queries/gallery.queries";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

export function GalleryControl() {
    const { data: session, status } = useSession();
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [activeTab, setActiveTab] = useState("ativos");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 9;

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [itemToEdit, setItemToEdit] = useState<GalleryItem | null>(null);

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

    const { data: galleryData, isLoading } = useGallery({
        wordFilter: debouncedSearchTerm,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        isActive: activeTab === "ativos",
    });

    const { data: allGalleryData } = useGallery({
        limit: 1000,
    });

    if (status === "loading") return null;

    if (!session || session.user.role !== "ADMIN") {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="bg-red-50 p-4 rounded-full">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Acesso Restrito</h1>
                <p className="text-gray-500 max-w-md">
                    Esta página e suas funcionalidades são exclusivas para administradores do sistema.
                </p>
            </div>
        );
    }

    const totalPages = galleryData?.meta?.totalPages || 0;
    const currentItems = galleryData?.data || [];

    const allItems = allGalleryData?.data || [];
    const activeCount = allItems.filter((i) => i.isActive).length;
    const inactiveCount = allItems.filter((i) => !i.isActive).length;

    const handleOpenDelete = (id: string) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleOpenEdit = (item: GalleryItem) => {
        setItemToEdit(item);
        setIsEditModalOpen(true);
    };

    return (
        <div className="flex flex-col gap-6 p-6 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Gestão da Galeria</h2>
                    <p className="text-gray-500 text-sm">
                        Gerencie o acervo visual da landing page com estilo e facilidade.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition shadow-sm text-sm font-semibold cursor-pointer border border-gray-200"
                    >
                        <Newspaper size={18} /> Importar de Post
                    </button>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition shadow-sm text-sm font-semibold cursor-pointer"
                    >
                        <Plus size={18} strokeWidth={2.5} /> Novo Upload
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
                            <TabsTab value="inativos" className="text-xs font-semibold data-selected:text-yellow-900">
                                Inativos ({inactiveCount})
                            </TabsTab>
                        </TabsList>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors">
                            {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar imagens pelo título..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2 bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-xl text-sm transition-all outline-none"
                        />
                    </div>
                </div>

                <TabsPanels>
                    <TabsPanel value={activeTab} className="pt-2">
                        <div className="relative min-h-75">
                            {isLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 size={40} className="animate-spin text-yellow-500" />
                                </div>
                            ) : currentItems.length === 0 ? (
                                <GalleryEmptyState
                                    onReset={() => {
                                        setSearchTerm("");
                                        setActiveTab("ativos");
                                    }}
                                />
                            ) : (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    {currentItems.map((item) => (
                                        <motion.div key={item.id} variants={itemVariants}>
                                            <GalleryCard
                                                item={item}
                                                onDelete={() => handleOpenDelete(item.id)}
                                                onEdit={() => handleOpenEdit(item)}
                                            />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    </TabsPanel>
                </TabsPanels>
            </Tabs>

            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                        Mostrando página <span className="font-semibold">{currentPage}</span> de{" "}
                        <span className="font-semibold">{totalPages}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || isLoading}
                            className="p-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition shadow-sm cursor-pointer"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg">
                            {currentPage} / {totalPages}
                        </div>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || isLoading}
                            className="p-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition shadow-sm cursor-pointer"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            <GalleryUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
            <GalleryImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
            <GalleryDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                itemId={itemToDelete}
            />
            <GalleryEditModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setItemToEdit(null);
                }}
                item={itemToEdit}
            />
        </div>
    );
}
