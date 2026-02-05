import { profileDataMock } from "@/src/infra/modules/student/profile-card-mock";
import { Menu, User } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "../../components/ui/button";
import { useSidebar } from "../../components/ui/sidebar";

const PAGE_META = [
    {
        match: (path: string) => path.startsWith("/available-courses"),
        title: "Cursos Disponíveis",
        description: "Explore e inscreva-se nos cursos oferecidos",
    },
    {
        match: (path: string) => path.startsWith("/presence"),
        title: "Progamação do Espaço 4.0",
        description: "Gerencie sua presença e acompanhe seus cursos",
    },
    {
        match: (path: string) => path.startsWith("/certifications"),
        title: "Certificados",
        description: "Visualize e baixe seus certificados",
    },
    {
        match: (path: string) => path.startsWith("/profile"),
        title: "Meu perfil",
        description: "Visualize e edite suas informações pessoais",
    },
    {
        match: (path: string) => path.startsWith("/calendar"),
        title: "Calendário",
        description: "Acompanhe seus eventos e atividades",
    },
];

export default function StudentTopbar() {
    const { toggleSidebar } = useSidebar();
    const pathname = usePathname() ?? "";
    const current = PAGE_META.find((item) => item.match(pathname)) ?? {
        title: "Painel",
        description: "Resumo das suas atividades",
    };

    return (
        <div className="relative border-b bg-white lg:px-5">
            <div className="flex items-center gap-3 px-4 py-4 pb-5 lg:flex-col lg:items-start lg:px-8 lg:py-5 lg:pb-6 2xl:px-15 2xl:py-5 2xl:pb-6">
                <Button variant="ghost" onClick={toggleSidebar} className="cursor-pointer lg:hidden shrink-0">
                    <Menu className="size-5" />
                </Button>
                <div className="flex-1 lg:w-full">
                    <h1 className="text-xl font-semibold mb-1 lg:mb-1.5 lg:text-2xl 2xl:text-3xl 2xl:mb-2">
                        {current.title}
                    </h1>
                    <p className="text-sm text-gray-600 lg:text-base">{current.description}</p>
                </div>
                <div className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2  items-center gap-2.5">
                    <div className="size-10 rounded-full bg-linear-to-br from-yellow-100 to-yellow-50 flex items-center justify-center ring-2 ring-yellow-200">
                        <User className="size-5 text-yellow-primary" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                        {profileDataMock.name}
                    </span>
                </div>
            </div>
        </div>
    );
}
