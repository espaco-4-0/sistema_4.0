import { BarChart3, ChartNoAxesColumnIncreasing, ClipboardCheck, FolderKanban, House, Medal, Package, Settings, Trophy, Users } from "lucide-react";

export const navItems = [
        { id: "visao-geral", name: "Visão Geral", icon: House },
        { id: "gerenciar-projetos", name: "Gerenciar Projetos", icon: FolderKanban },
        { id: "gerenciar-usuarios", name: "Gerenciar Usuários", icon: Users },
        { id: "relatorios", name: "Relatórios", icon: BarChart3 },
        { id: "controle-presenca", name: "Controle de Presença", icon: ClipboardCheck },
        { id: "certificados", name: "Certificados", icon: Medal },
        { id: "gamificacao", name: "Gamificação & Prêmios", icon: Trophy },
        { id: "recursos", name: "Recursos", icon: Package },
        { id: "analises", name: "Análise de Dados", icon: ChartNoAxesColumnIncreasing },
        { id: "configuracoes", name: "Configurações", icon: Settings },
    ];
