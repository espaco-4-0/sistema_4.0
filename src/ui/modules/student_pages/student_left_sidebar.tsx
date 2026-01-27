"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/ui/components/ui/avatar";
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
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebar_options = [
    {
        id: 1,
        icon: ClipboardCheck,
        title: "Controle de Presença",
        link: "/presence",
    },
    {
        id: 2,
        icon: BookOpen,
        title: "Cursos Disponíveis",
        link: "/available-courses",
    },
    {
        id: 3,
        icon: Award,
        title: "Certificados",
        link: "/certifications",
    },
    {
        id: 4,
        icon: User,
        title: "Meu perfil",
        link: "/profile",
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
        <Sidebar>
            <SidebarHeader className="bg-white">
                <div className="flex flex-row items-center gap-3 bg-yellow-primary m-3 rounded-lg p-2">
                    <div className="flex justify-center items-center bg-white size-11 rounded-md text-lg font-semibold">
                        4.0
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-base font-semibold">Espaço 4.0</span>
                        <span className="text-sm text-gray-800">Área do Aluno</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-white">
                <SidebarGroup>
                    {sidebar_options.map(({ id, icon: Icon, title, link }) => (
                        <SidebarMenuItem key={id}>
                            <SidebarMenuButton
                                asChild
                                className={
                                    link === selected
                                        ? "h-full text-base cursor-pointer w-full bg-yellow-secondary hover:bg-yellow-secondary-dark active:bg-yellow-secondary transition-all"
                                        : "h-full text-base cursor-pointer w-full"
                                }
                            >
                                <Link href={link} className="flex items-center gap-2">
                                    <Icon className="ml-1 size-5" />
                                    <span className="font-medium">{title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="bg-white">
                <SidebarMenuItem className="flex items-center gap-3 m-0.5">
                    <Avatar className="rounded-md size-11">
                        <AvatarImage src="Icone-Espaco4.0.svg" alt="Icone de perfil" />
                        <AvatarFallback>I</AvatarFallback>
                        {/* Alterar aqui depois pra nois colocar pra ser a primeira letra do nome do usuario e imprimila em maiusculo, ou as 2 primeiras, pode ser tbm */}
                    </Avatar>
                    <div className="flex flex-col gap-1 leading-5 w-full justify-center">
                        <span className="text-sm font-semibold">Jaozin</span>
                        <span className="text-xs text-gray-800">jaozin@email.com </span>
                    </div>
                    <SidebarMenuButton className="flex justify-center items-center cursor-pointer w-10 p-2 active:bg-gray-description-light transition-all duration-500">
                        <LogOut />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarFooter>
        </Sidebar>
    );
}
