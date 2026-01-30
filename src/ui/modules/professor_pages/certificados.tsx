"use client";

import { useState } from "react";
import { GenerateBatchModal } from "@/src/ui/components/modals/professor/certificados/generate-batch-modal";
import { GenerateSingleModal } from "@/src/ui/components/modals/professor/certificados/generate-single-modal";
import { TemplateBuilderModal } from "@/src/ui/components/modals/professor/certificados/template-builder-modal";
import { Button } from "@/src/ui/components/ui/button";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { Award, FileUp, PenLine, ShieldCheck, Star, Users } from "lucide-react";
import { toast } from "sonner";

const stats = [
    {
        title: "Total gerados",
        value: "1.248",
        detail: "Últimos 30 dias",
        icon: Award,
        color: "bg-green-100",
        iconColor: "text-green-700",
    },
    {
        title: "Participação",
        value: "845",
        detail: "Certificados emitidos",
        icon: Users,
        color: "bg-yellow-100",
        iconColor: "text-yellow-700",
    },
    {
        title: "Conclusão",
        value: "312",
        detail: "Cursos finalizados",
        icon: ShieldCheck,
        color: "bg-purple-100",
        iconColor: "text-purple-700",
    },
    {
        title: "Excelência",
        value: "91",
        detail: "Destaques acadêmicos",
        icon: Star,
        color: "bg-red-100",
        iconColor: "text-red-700",
    },
];

const students = [
    { name: "Larissa Mendes", course: "Robótica Educacional", status: "Concluído" },
    { name: "Pedro Alves", course: "Pesquisa Aplicada", status: "Em andamento" },
    { name: "Camila Rocha", course: "Projeto Integrador", status: "Concluído" },
    { name: "Tiago Luz", course: "Monitoria de Sistemas", status: "Concluído" },
];

const templates = [
    { name: "Participação Geral", type: "Participação", updated: "14/01/2026", preview: "bg-yellow-100" },
    { name: "Conclusão Avançada", type: "Conclusão", updated: "08/01/2026", preview: "bg-yellow-50" },
    { name: "Excelência Acadêmica", type: "Excelência", updated: "02/01/2026", preview: "bg-yellow-200" },
];

export default function Certificados() {
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    const handleSaveSignature = () => {
        toast.success("Assinatura salva com sucesso!");
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div></div>
                <div className="flex gap-3">
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:cursor-pointer transition shadow-sm text-sm font-medium"
                        onClick={() => setIsBatchModalOpen(true)}
                    >
                        <FileUp size={18} /> Gerar em lote
                    </button>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition shadow-sm text-sm hover:cursor-pointer font-medium"
                        onClick={() => setIsSingleModalOpen(true)}
                    >
                        <Award size={18} /> Gerar único
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.title}
                            className="bg-white rounded-xl border border-gray-100 p-6 hover:border-gray-200 border-b-4 border-b-transparent hover:border-b-yellow-primary transition-all duration-300"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">{item.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                                </div>
                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}
                                >
                                    <Icon className={`w-6 h-6 ${item.iconColor}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold">Templates</h3>
                        <p className="text-gray-500 text-sm">Crie e edite layouts de certificados</p>
                    </div>
                    <div className="space-y-3">
                        {templates.map((item) => (
                            <div
                                key={item.name}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border rounded-xl p-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-20 h-12 rounded-lg border border-yellow-200 ${item.preview}`} />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {item.type} • Atualizado em {item.updated}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Visualizar
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Editar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-end">
                        <Button
                            className="bg-yellow-400 text-gray-900 hover:cursor-pointer hover:bg-yellow-500"
                            onClick={() => setIsTemplateModalOpen(true)}
                        >
                            Novo template
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold">Assinatura</h3>
                        <p className="text-gray-500 text-sm">Atualize dados e imagem do responsável</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center border border-yellow-200">
                                <PenLine className="w-6 h-6 text-black" />
                            </div>
                            <Button
                                variant="secondary"
                                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                            >
                                Alterar assinatura
                            </Button>
                        </div>
                        <div className="space-y-1">
                            <Label>Nome</Label>
                            <Input placeholder="Ex.: Prof. Ana Costa" />
                        </div>
                        <div className="space-y-1">
                            <Label>Cargo</Label>
                            <Input placeholder="Ex.: Coordenadora Acadêmica" />
                        </div>
                    </div>
                    <div className="flex items-center justify-end">
                        <Button
                            className="bg-yellow-400 text-gray-900 hover:cursor-pointer hover:bg-yellow-500"
                            onClick={handleSaveSignature}
                        >
                            Salvar assinatura
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-2 overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center border-b border-gray-100">
                    <div className="relative w-full max-w-md">
                        <Input placeholder="Buscar alunos ou certificados..." className="bg-gray-50" />
                    </div>
                    <Button
                        variant="secondary"
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        Filtros
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Aluno
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Curso
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Template
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.map((student) => (
                                <tr key={student.name} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{student.course}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-gray-700 border border-yellow-100">
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">Participação Geral</td>
                                    <td className="px-6 py-4 text-sm text-right">
                                        <Button
                                            variant="secondary"
                                            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                                        >
                                            Emitir
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <GenerateBatchModal
                isOpen={isBatchModalOpen}
                onOpenChange={setIsBatchModalOpen}
                onClose={() => setIsBatchModalOpen(false)}
                templates={templates}
            />

            <GenerateSingleModal
                isOpen={isSingleModalOpen}
                onOpenChange={setIsSingleModalOpen}
                onClose={() => setIsSingleModalOpen(false)}
                templates={templates}
                students={students}
            />

            <TemplateBuilderModal
                isOpen={isTemplateModalOpen}
                onOpenChange={setIsTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
            />
        </div>
    );
}
