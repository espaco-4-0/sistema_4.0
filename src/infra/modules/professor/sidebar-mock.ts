import {
    BarChart3,
    ClipboardCheck,
    FolderKanban,
    House,
    Medal,
    Package,
    Settings,
    Trophy,
    Users,
} from "lucide-react";

export const navItems = [
    { id: "visao-geral", name: "Visão Geral", icon: House },
    { id: "gerenciar-projetos", name: "Gerenciar Projetos", icon: FolderKanban },
    { id: "gerenciar-usuarios", name: "Gerenciar Usuários", icon: Users },
    { id: "relatorios", name: "Relatórios", icon: BarChart3 },
	{ id: "certificados", name: "Certificados", icon: Medal },
    { id: "controle-presenca", name: "Controle de Presença", icon: ClipboardCheck },
    { id: "gamificacao", name: "Gamificação & Prêmios", icon: Trophy },
    { id: "recursos", name: "Recursos", icon: Package },
    { id: "configuracoes", name: "Configurações", icon: Settings },
];
