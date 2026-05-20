"use client";

import { useEffect, useState } from "react";
import type { BlogPost } from "@/src/infra/modules/blog/blog.types";
import { Dialog, DialogContent, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Loader2, Newspaper, Pencil, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { useCategories, useCreatePost, useUpdatePost } from "../../queries/news.queries";
import { useUsersList } from "../../queries/users.queries";
import { Field, SimpleSelect, TextArea, TextInput } from "./news-form";
import { generateSlug } from "./news-utils";

interface PostModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    postToEdit: BlogPost | null;
}

type FormData = {
    titulo: string;
    slug: string;
    conteudo: string;
    resumo: string;
    categoria: string;
    authorId: string;
    publicado: boolean;
};

const EMPTY_FORM: FormData = {
    titulo: "",
    slug: "",
    conteudo: "",
    resumo: "",
    categoria: "",
    authorId: "",
    publicado: false,
};

export function PostModal({ isOpen, onOpenChange, postToEdit }: PostModalProps) {
    const { data: session } = useSession();
    const { data: users = [] } = useUsersList();
    const { data: categories = [] } = useCategories(true);
    const createMutation = useCreatePost();
    const updateMutation = useUpdatePost();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

    const set = (patch: Partial<FormData>) => setFormData((prev) => ({ ...prev, ...patch }));

    useEffect(() => {
        if (!isOpen) return;
        if (postToEdit) {
            set({
                titulo: postToEdit.titulo || "",
                slug: postToEdit.slug || "",
                conteudo: postToEdit.conteudo || "",
                resumo: postToEdit.resumo || "",
                categoria: postToEdit.categoria?.nome || "Inovação",
                authorId: postToEdit.autorId || "",
                publicado: postToEdit.publicado || false,
            });
        } else {
            set({ ...EMPTY_FORM, categoria: categories[0]?.nome || "", authorId: session?.user?.id || "" });
        }
        setSelectedFile(null);
    }, [isOpen, postToEdit, categories, session]);

    const handleSave = async () => {
        if (!formData.authorId) return toast.error("O autor é obrigatório.");
        if (!postToEdit && !selectedFile) return toast.error("A imagem de capa é obrigatória para novos posts.");

        const data = new FormData();
        data.append("title", formData.titulo);
        data.append("slug", formData.slug || generateSlug(formData.titulo));
        data.append("content", formData.conteudo);
        data.append("summary", formData.resumo);
        data.append("category", formData.categoria);
        data.append("published", String(formData.publicado));
        data.append("authorId", formData.authorId);

        if (selectedFile) data.append("file", selectedFile);

        const opts = { onSuccess: () => onOpenChange(false) };
        postToEdit ? updateMutation.mutate({ slug: postToEdit.slug, data }, opts) : createMutation.mutate(data, opts);
    };

    const isPending = createMutation.isPending || updateMutation.isPending;
    const isEdit = !!postToEdit;

    const userItems = users.map((u: any) => ({ key: u.id, value: u.id, label: `${u.nomeCompleto} (${u.email})` }));
    const categoryItems = categories.map((c: any) => ({ key: c.id, value: c.nome, label: c.nome }));

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-[95%] p-0 bg-white rounded-3xl overflow-hidden border-none max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <header className="bg-yellow-400 p-6 flex items-center gap-3 text-gray-900 sticky top-0 z-10">
                    <div className="bg-white/20 p-2 rounded-xl">
                        {isEdit ? <Pencil size={24} /> : <Plus size={24} />}
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-bold">
                            {isEdit ? "Editar Postagem" : "Criar Novo Post"}
                        </DialogTitle>
                        <p className="text-xs font-medium opacity-80 uppercase tracking-wider mt-0.5">Módulo de Blog</p>
                    </div>
                </header>

                <div className="p-8 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <Field label="Título da Notícia">
                                <TextInput
                                    value={formData.titulo}
                                    placeholder="Ex: Novo Laboratório de Robótica..."
                                    maxLength={150}
                                    minLength={10}
                                    onChange={(titulo) =>
                                        set({
                                            titulo,
                                            slug:
                                                !formData.slug || formData.slug === generateSlug(formData.titulo)
                                                    ? generateSlug(titulo)
                                                    : formData.slug,
                                        })
                                    }
                                />
                            </Field>

                            <Field label="Slug (URL amigável)">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="ex: novo-laboratorio-de-robotica"
                                        value={formData.slug}
                                        onChange={(e) => set({ slug: generateSlug(e.target.value) })}
                                        className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-yellow-400 focus:bg-white transition-all text-gray-700 placeholder:text-gray-300 font-mono text-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => set({ slug: generateSlug(formData.titulo) })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-yellow-600 hover:text-yellow-700 cursor-pointer"
                                    >
                                        Gerar
                                    </button>
                                </div>
                            </Field>

                            <Field label="Autor Vinculado">
                                <SimpleSelect
                                    value={formData.authorId}
                                    onValueChange={(authorId) => set({ authorId })}
                                    placeholder="Selecione o autor"
                                    items={userItems}
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Categoria">
                                    <SimpleSelect
                                        value={formData.categoria}
                                        onValueChange={(categoria) => set({ categoria })}
                                        items={categoryItems}
                                    />
                                </Field>

                                <Field label="Estado">
                                    <div className="flex bg-gray-100 p-1.5 rounded-2xl h-[52px]">
                                        {[
                                            {
                                                label: "Rascunho",
                                                value: false,
                                                active: "bg-white text-gray-900 shadow-sm",
                                            },
                                            {
                                                label: "Publicar",
                                                value: true,
                                                active: "bg-green-500 text-white shadow-sm",
                                            },
                                        ].map(({ label, value, active }) => (
                                            <button
                                                key={label}
                                                onClick={() => set({ publicado: value })}
                                                className={`flex-1 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${formData.publicado === value ? active : "text-gray-400 hover:text-gray-600"}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </Field>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Field label="Imagem de Capa">
                                <div
                                    className={`relative h-54 rounded-3xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-3 ${selectedFile ? "border-green-400 bg-green-50/10" : "border-gray-200 bg-gray-50 hover:bg-gray-100/50 hover:border-yellow-400"}`}
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
                                            <p className="text-sm font-bold text-gray-800 line-clamp-1">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black mt-1">
                                                {(selectedFile.size / 1024).toFixed(0)} KB • Clique para trocar
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-white p-4 rounded-2xl shadow-sm text-gray-400">
                                                <Plus size={32} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-gray-800">Upload da Imagem</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-black mt-1">
                                                    PNG, JPG ou WEBP até 5MB
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {isEdit && !selectedFile && (
                                    <p className="text-[10px] text-gray-400 font-medium italic text-center">
                                        A imagem atual será mantida se nenhuma for selecionada.
                                    </p>
                                )}
                            </Field>
                        </div>
                    </div>

                    <Field label="Resumo Curto (SEO)">
                        <TextArea
                            value={formData.resumo}
                            onChange={(resumo) => set({ resumo })}
                            placeholder="Uma breve descrição que aparecerá nos cards da listagem..."
                            maxLength={500}
                            minLength={20}
                        />
                    </Field>

                    <Field label="Conteúdo da Notícia">
                        <TextArea
                            value={formData.conteudo}
                            onChange={(conteudo) => set({ conteudo })}
                            placeholder="Conteúdo completo da notícia (suporta parágrafos)..."
                            maxLength={20000}
                            minHeight="400px"
                            minLength={100}
                        />
                    </Field>
                </div>

                <footer className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-6 py-3 text-gray-500 font-bold hover:text-gray-800 transition-colors cursor-pointer"
                    >
                        Descartar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="flex items-center gap-2 px-8 py-3 bg-yellow-400 text-gray-900 rounded-xl font-bold hover:bg-yellow-500 transition-all shadow-md shadow-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isEdit ? "Salvar Alterações" : "Criar Publicação"}
                    </button>
                </footer>
            </DialogContent>
        </Dialog>
    );
}
