"use client";

import { useState } from "react";
import { CatalogModal } from "@/src/ui/components/modals/professor/gamificacao/catalog-modal";
import { CreateCampaignModal } from "@/src/ui/components/modals/professor/gamificacao/create-campaign-modal";
import { NewMissionModal } from "@/src/ui/components/modals/professor/gamificacao/new-mission-modal";
import { Button } from "@/src/ui/components/ui/button";
import { AlertCircle, Crown, Flame, Gift, Medal, Star, Target, Trophy, Users } from "lucide-react";
import { useSession } from "next-auth/react";

const highlights = [
    {
        title: "Alunos engajados",
        value: "1.248",
        detail: "+12% na última semana",
        icon: Users,
        color: "text-blue-700",
        bgColor: "bg-blue-100",
    },
    {
        title: "Prêmios resgatados",
        value: "312",
        detail: "Taxa de resgate 78%",
        icon: Gift,
        color: "text-green-700",
        bgColor: "bg-green-100",
    },
    {
        title: "Pontuação média",
        value: "865 pts",
        detail: "Meta 900 pts",
        icon: Star,
        color: "text-yellow-700",
        bgColor: "bg-yellow-100",
    },
];

const rewards = [
    {
        title: "Kit Maker Lab",
        points: "1.200 pts",
        detail: "Ideal para projetos IoT",
        icon: Trophy,
    },
    {
        title: "Curso Premium",
        points: "900 pts",
        detail: "Acesso por 6 meses",
        icon: Medal,
    },
    {
        title: "Mentoria Individual",
        points: "700 pts",
        detail: "Sessão de 1h",
        icon: Crown,
    },
];

const missions = [
    {
        title: "Projeto colaborativo",
        progress: "8/10 tarefas",
        detail: "Liberar badge Equipe",
        icon: Target,
    },
    {
        title: "Trilha de pesquisa",
        progress: "3/5 entregas",
        detail: "Libera 150 pts",
        icon: Flame,
    },
    {
        title: "Desafio semanal",
        progress: "Concluído",
        detail: "Bônus 80 pts",
        icon: Star,
    },
];

const leaderboard = [
    { name: "Larissa Mendes", points: "1.540 pts", badge: "Top 1" },
    { name: "Pedro Alves", points: "1.430 pts", badge: "Top 2" },
    { name: "Camila Rocha", points: "1.380 pts", badge: "Top 3" },
    { name: "Tiago Luz", points: "1.240 pts", badge: "Top 4" },
];

export default function Gamificacao() {
    const { data: session, status } = useSession();
    const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [isNewMissionOpen, setIsNewMissionOpen] = useState(false);

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

    return (
        <div className="space-y-6">
            <div className="bg-linear-to-r bg-yellow-primary rounded-2xl p-8 text-white shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <p className="text-sm uppercase tracking-wide text-black">Gamificação & Prêmios</p>
                        <h1 className="text-3xl font-bold mt-2 text-black">Recompensas para engajar alunos</h1>
                        <p className="text-sm text-black/90 mt-2 max-w-xl">
                            Incentive participação, pesquisas e projetos com trilhas de pontos e prêmios reais.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            className="bg-white hover:cursor-pointer text-black hover:bg-yellow-50"
                            onClick={() => setIsCreateCampaignOpen(true)}
                        >
                            Criar campanha
                        </Button>
                        <Button
                            variant="secondary"
                            className="bg-white/20 hover:cursor-pointer text-black hover:bg-white/30"
                            onClick={() => setIsCatalogOpen(true)}
                        >
                            Ver catálogo
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {highlights.map((item) => {
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
                                    <p className="text-xs text-gray-500 mt-1">{item.detail}</p>
                                </div>
                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bgColor}`}
                                >
                                    <Icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold">Catálogo de Prêmios</h3>
                        <p className="text-gray-500 text-sm">Itens mais desejados pelos alunos</p>
                    </div>
                    <div className="space-y-4">
                        {rewards.map((reward) => {
                            const Icon = reward.icon;
                            return (
                                <div
                                    key={reward.title}
                                    className="flex items-center justify-between gap-4 border rounded-xl p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{reward.title}</p>
                                            <p className="text-xs text-gray-500">{reward.detail}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">{reward.points}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center justify-end">
                        <Button
                            variant="secondary"
                            className="hover:cursor-pointer"
                            onClick={() => setIsCatalogOpen(true)}
                        >
                            Gerenciar prêmios
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold">Ranking Semanal</h3>
                        <p className="text-gray-500 text-sm">Top alunos por pontuação</p>
                    </div>
                    <div className="space-y-3">
                        {leaderboard.map((student, index) => (
                            <div key={student.name} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {index + 1}. {student.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{student.badge}</p>
                                </div>
                                <span className="text-xs font-semibold text-yellow-600">{student.points}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-end">
                        <Button variant="secondary">Ver ranking completo</Button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold">Missões e Desafios</h3>
                    <p className="text-gray-500 text-sm">Defina metas para cursos, monitores e pesquisadores</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {missions.map((mission) => {
                        const Icon = mission.icon;
                        return (
                            <div key={mission.title} className="border rounded-xl p-4 space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <Icon className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">{mission.title}</p>
                                </div>
                                <p className="text-xs text-gray-500">{mission.detail}</p>
                                <p className="text-sm font-semibold text-gray-900">{mission.progress}</p>
                            </div>
                        );
                    })}
                </div>
                <div className="flex items-center justify-end">
                    <Button
                        className="bg-yellow-primary text-black hover:bg-yellow-secondary hover:cursor-pointer"
                        onClick={() => setIsNewMissionOpen(true)}
                    >
                        Nova missão
                    </Button>
                </div>
            </div>

            <CreateCampaignModal
                isOpen={isCreateCampaignOpen}
                onOpenChange={setIsCreateCampaignOpen}
                onClose={() => setIsCreateCampaignOpen(false)}
            />

            <CatalogModal
                isOpen={isCatalogOpen}
                onOpenChange={setIsCatalogOpen}
                onClose={() => setIsCatalogOpen(false)}
            />

            <NewMissionModal
                isOpen={isNewMissionOpen}
                onOpenChange={setIsNewMissionOpen}
                onClose={() => setIsNewMissionOpen(false)}
            />
        </div>
    );
}
