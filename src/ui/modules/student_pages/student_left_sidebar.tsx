import { useEffect, useState } from "react";
import { profileDataMock } from "@/src/infra/modules/student/profile-card-mock";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/src/ui/components/ui/sidebar";
import { Award, BookOpen, ClipboardCheck, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebar_options = [
    {
        id: 1,
        icon: ClipboardCheck,
        title: "Controle de Presença",
        link: "/estudante/presence",
    },
    {
        id: 2,
        icon: BookOpen,
        title: "Cursos Disponíveis",
        link: "/estudante/available-courses",
    },
    {
        id: 3,
        icon: Award,
        title: "Certificados",
        link: "/estudante/certifications",
    },
    {
        id: 4,
        icon: User,
        title: "Meu perfil",
        link: "/estudante/profile",
    },
];

export default function StudentLeftSidebar() {
    const [selected, setSelected] = useState("");
    const pathname = usePathname();

    useEffect(() => {
        const currentOption = sidebar_options.find((i) => pathname?.startsWith(i.link))?.link ?? "";
        setSelected(currentOption);
    }, [pathname]);

    return (
        <Sidebar className="w-72">
            <SidebarHeader className="bg-white px-5 py-5 gap-3 lg:px-6 lg:py-5 lg:gap-3 2xl:px-6 2xl:py-5 2xl:gap-3 flex flex-row items-center">
                <div className="size-12 lg:size-12 2xl:size-14 overflow-hidden rounded-2xl shadow">
                    <Image
                        src="/Icone-Espaco4.0.svg"
                        width={60}
                        height={60}
                        className="size-full object-cover scale-[1.05]"
                        alt="asd"
                    />
                </div>
                <span className="text-base lg:text-base 2xl:text-lg font-bold">Espaço 4.0</span>
            </SidebarHeader>

            <SidebarContent className="bg-white">
                <SidebarGroup className="flex flex-col gap-2">
                    {sidebar_options.map(({ id, icon: Icon, title, link }) => (
                        <SidebarMenuItem key={id} className="flex flex-col items-center">
                            <SidebarMenuButton
                                asChild
                                className={`h-full text-base cursor-pointer w-22/24 py-2.5 lg:py-3 2xl:py-3 rounded-xl transition-all duration-250 ${
                                    link === selected
                                        ? "bg-linear-to-r from-yellow-primary to-yellow-secondary transition-all shadow"
                                        : "text-gray-500"
                                }`}
                            >
                                <Link
                                    href={link}
                                    className="py-2 lg:py-2 2xl:py-2 flex items-center gap-2 lg:gap-2 2xl:gap-2"
                                >
                                    <Icon className="ml-2 lg:ml-2 2xl:ml-2 mr-1 lg:mr-1 2xl:mr-1 size-5 lg:size-5 2xl:size-5!" />
                                    <span className="text-sm lg:text-sm 2xl:text-sm font-semibold">{title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="bg-white p-4 lg:p-5 2xl:p-5 border-t">
                <div className="lg:hidden flex items-center gap-3 mb-4 pb-4 border-b">
                    <div className="size-10 rounded-full bg-linear-to-br from-yellow-100 to-yellow-50 flex items-center justify-center ring-2 ring-yellow-200 shrink-0">
                        <User className="size-5 text-yellow-primary" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                            {profileDataMock.nome} {profileDataMock.sobrenome}
                        </p>
                        <p className="text-xs text-gray-600 truncate">{profileDataMock.role}</p>
                    </div>
                </div>
                <SidebarMenuItem className="flex items-center gap-2 lg:gap-3 2xl:gap-3">
                    <SidebarMenuButton className="w-auto transition-all py-3.5 lg:py-5 2xl:py-5 px-3 lg:px-3 2xl:px-3 text-red-600 text-sm lg:text-sm 2xl:text-base font-semibold hover:bg-red-100 hover:text-red-500 cursor-pointer">
                        <LogOut className="size-5 lg:size-5 2xl:size-5" />
                        <span className="text-sm lg:text-sm 2xl:text-base">Sair</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarFooter>
        </Sidebar>
    );
}
