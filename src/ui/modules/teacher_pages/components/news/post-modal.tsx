"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Newspaper, Pencil, Plus, Search, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/src/ui/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/ui/components/ui/select";
import { toast } from "sonner";
import type { BlogPost } from "@/src/infra/modules/blog/blog.types";
import { useCategories, useCreatePost, useUpdatePost } from "../../queries/news.queries";
import { useUsersList } from "../../queries/users.queries";

interface PostModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    postToEdit: BlogPost | null;
}


function generateSlug(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export function PostModal({ isOpen, onOpenChange, postToEdit }: PostModalProps) {
    const { data: session } = useSession();
    const { data: users = [] } = useUsersList();
    const { data: categories = [] } = useCategories(true);
    const createMutation = useCreatePost();
    const updateMutation = useUpdatePost();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        titulo: "",
        slug: "",
        conteudo: "",
        resumo: "",
        categoria: "",
        authorId: "",
        publicado: false,
    });

    useEffect(() => {
        if (isOpen && postToEdit) {
            setFormData({
                titulo: postToEdit.titulo || "",
                slug: postToEdit.slug || "",
                conteudo: postToEdit.conteudo || "",
                resumo: postToEdit.resumo || "",
                categoria: postToEdit.categoria?.nome || "Inovação",
                authorId: postToEdit.autorId || "",
                publicado: postToEdit.publicado || false,
            });
            setSelectedFile(null);
        } else if (isOpen) {
            setFormData({
                titulo: "",
                slug: "",
                conteudo: "",
                resumo: "",
                categoria: categories[0]?.nome || "",
                authorId: session?.user?.id || "",
                publicado: false,
            });
            setSelectedFile(null);
        }
    }, [isOpen, postToEdit, session?.user?.id, categories]);

    const handleSave = async () => {
        if (!formData.authorId) {
            toast.error("O autor é obrigatório.");
            return;
        }

        const data = new FormData();
        data.append("title", formData.titulo);
        data.append("slug", formData.slug || generateSlug(formData.titulo));
        data.append("content", formData.conteudo);
        data.append("summary", formData.resumo);
        data.append("category", formData.categoria);
        data.append("published", String(formData.publicado));
        data.append("authorId", formData.authorId);

        if (selectedFile) {
            data.append("file", selectedFile);
        }

        if (postToEdit) {
            updateMutation.mutate({ slug: postToEdit.slug, data }, {
                onSuccess: () => onOpenChange(false)
            });
        } else {
            if (!selectedFile) {
                toast.error("A imagem de capa é obrigatória para novos posts.");
                return;
            }
            createMutation.mutate(data, {
                onSuccess: () => onOpenChange(false)
            });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-[95%] p-0 bg-white rounded-3xl overflow-hidden border-none max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="bg-yellow-400 p-6 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3 text-gray-900">
                        <div className="bg-white/20 p-2 rounded-xl">
                            {postToEdit ? <Pencil size={24} /> : <Plus size={24} />}
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold">{postToEdit ? "Editar Postagem" : "Criar Novo Post"}</DialogTitle>
                            <p className="text-xs font-medium opacity-80 uppercase tracking-wider mt-0.5">Módulo de Blog</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Título da Notícia</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Ex: Novo Laboratório de Robótica..."
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-yellow-400 focus:bg-white transition-all text-gray-800 placeholder:text-gray-300 font-medium"
                                        value={formData.titulo}
                                        onChange={(e) => {
                                            const newTitle = e.target.value;
                                            setFormData((prev) => ({
                                                ...prev,
                                                titulo: newTitle,
                                                // Se o slug estiver vazio ou for igual ao slug gerado pelo título antigo, atualiza
                                                slug: (!prev.slug || prev.slug === generateSlug(prev.titulo))
                                                    ? generateSlug(newTitle)
                                                    : prev.slug
                                            }));
                                        }}
                                        maxLength={150}
                                    />
                                    <div className="absolute right-4 bottom-4 text-[10px] font-bold text-gray-300 group-focus-within:text-yellow-500 transition-colors">
                                        {formData.titulo.length}/150
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Slug (URL amigável)</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="ex: novo-laboratorio-de-robotica"
                                        className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-yellow-400 focus:bg-white transition-all text-gray-700 placeholder:text-gray-300 font-mono text-xs"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, slug: generateSlug(formData.titulo) })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-yellow-600 hover:text-yellow-700 cursor-pointer"
                                    >
                                        Gerar
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Autor Vinculado</label>
                                <Select
                                    value={formData.authorId}
                                    onValueChange={(val) => setFormData({ ...formData, authorId: val })}
                                >
                                    <SelectTrigger className="w-full px-5 py-6 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-0 focus:border-yellow-400 focus:bg-white transition-all text-gray-800 font-medium shadow-none">
                                        <SelectValue placeholder="Selecione o autor" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-2 border-gray-100 rounded-2xl shadow-xl p-2">
                                        {users.length > 0 ? (
                                            users.map((user: any) => (
                                                <SelectItem
                                                    key={user.id}
                                                    value={user.id}
                                                    className="rounded-xl py-3 focus:bg-yellow-50 focus:text-yellow-900 cursor-pointer"
                                                >
                                                    {user.nomeCompleto} ({user.email})
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="none" disabled className="text-gray-400 italic">
                                                Nenhum usuário encontrado
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Categoria</label>
                                    <Select
                                        value={formData.categoria}
                                        onValueChange={(val) => setFormData({ ...formData, categoria: val })}
                                    >
                                        <SelectTrigger className="w-full px-5 py-6 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-0 focus:border-yellow-400 focus:bg-white transition-all text-gray-800 font-medium shadow-none">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-2 border-gray-100 rounded-2xl shadow-xl p-2">
                                            {categories.map((cat: any) => (
                                                <SelectItem key={cat.id} value={cat.nome} className="rounded-xl py-3 focus:bg-yellow-50 focus:text-yellow-900 cursor-pointer">
                                                    {cat.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Estado</label>
                                    <div className="flex bg-gray-100 p-1.5 rounded-2xl h-[52px]">
                                        <button
                                            onClick={() => setFormData({ ...formData, publicado: false })}
                                            className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all ${!formData.publicado ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                        >
                                            Rascunho
                                        </button>
                                        <button
                                            onClick={() => setFormData({ ...formData, publicado: true })}
                                            className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all ${formData.publicado ? "bg-green-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                        >
                                            Publicar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Imagem de Capa</label>
                                <div
                                    className={`relative h-[216px] rounded-3xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-3 ${selectedFile ? "border-green-400 bg-green-50/10" : "border-gray-200 bg-gray-50 hover:bg-gray-100/50 hover:border-yellow-400"}`}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    />
                                    {selectedFile ? (
                                        <div className="text-center p-4">
                                            <div className="bg-green-100 text-green-600 p-3 rounded-2xl mx-auto w-fit mb-2">
                                                <Newspaper size={32} />
                                            </div>
                                            <p className="text-sm font-bold text-gray-800 line-clamp-1">{selectedFile.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black mt-1">{(selectedFile.size / 1024).toFixed(0)} KB • Clique para trocar</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-white p-4 rounded-2xl shadow-sm text-gray-400">
                                                <Plus size={32} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-gray-800">Upload da Imagem</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-black mt-1">PNG, JPG ou WEBP até 5MB</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {postToEdit && !selectedFile && (
                                    <p className="text-[10px] text-gray-400 font-medium italic text-center">A imagem atual será mantida se nenhuma for selecionada.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Resumo Curto (SEO)</label>
                        <div className="relative group">
                            <textarea
                                placeholder="Uma breve descrição que aparecerá nos cards da listagem..."
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-yellow-400 focus:bg-white transition-all text-gray-800 placeholder:text-gray-300 font-medium min-h-[100px] resize-none"
                                value={formData.resumo}
                                onChange={(e) => setFormData({ ...formData, resumo: e.target.value })}
                                maxLength={500}
                            />
                            <div className="absolute right-4 bottom-4 text-[10px] font-bold text-gray-300 group-focus-within:text-yellow-500 transition-colors">
                                {formData.resumo.length}/500
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Conteúdo da Notícia</label>
                        <div className="relative group">
                            <textarea
                                placeholder="Conteúdo completo da notícia (suporta parágrafos)..."
                                className="w-full px-5 py-6 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-yellow-400 focus:bg-white transition-all text-gray-800 placeholder:text-gray-300 font-medium min-h-[400px]"
                                value={formData.conteudo}
                                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                                maxLength={20000}
                            />
                            <div className="absolute right-4 bottom-4 text-[10px] font-bold text-gray-300 group-focus-within:text-yellow-500 transition-colors">
                                {formData.conteudo.length}/20000
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-6 py-3 text-gray-500 font-bold hover:text-gray-800 transition-colors cursor-pointer"
                    >
                        Descartar
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={isPending}
                            className="flex items-center gap-2 px-8 py-3 bg-yellow-400 text-gray-900 rounded-xl font-bold hover:bg-yellow-500 transition-all shadow-md shadow-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            {postToEdit ? "Salvar Alterações" : "Criar Publicação"}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
