"use client";

import { useState } from "react";
import GerenciarUsuarios from "@/src/ui/modules/professor_pages/gerenciar_usuarios";
import { Header } from "@/src/ui/modules/professor_pages/header";
import { Sidebar } from "@/src/ui/modules/professor_pages/sidebar";
import { VisaoGeral } from "@/src/ui/modules/professor_pages/visao_geral";

export default function Professor() {
    const [currentView, setCurrentView] = useState("visao-geral");

    const renderContent = () => {
        switch (currentView) {
            case "visao-geral":
                return VisaoGeral();
            case "gerenciar-projetos":
                return <div className="p-4 bg-white rounded-lg border">Projects List Here</div>;
            case "gerenciar-usuarios":
                return GerenciarUsuarios();
            case "recursos":
                return <div className="p-4 bg-white rounded-lg border">Equipment Inventory</div>;
            case "relatorios":
                return <div className="p-4 bg-white rounded-lg border">Relatorios de projetos</div>;
            case "configuracoes":
                return <div className="p-4 bg-white rounded-lg border">Configuracoes</div>;
            case "gamificacao":
                return <div></div>;
            case "certificacao":
                return <div></div>;
			case "analises":
				return <div></div>
			case "controle-presenca":
				return <div></div>
			case "certificados":
				return <div></div>

            default:
                return (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <span className="text-lg">Esta funcionalidade está em desenvolvimento.</span>
                        <span className="text-sm">View: {currentView}</span>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
            <div className="w-72 shrink-0">
                <Sidebar activeView={currentView} onNavigate={setCurrentView} />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
                <Header currentView={currentView} />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">{renderContent()}</div>
                </main>
            </div>
        </div>
    );
}
