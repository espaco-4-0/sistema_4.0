"use client";

import { useState } from "react";
import { Button } from "@/src/ui/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@radix-ui/react-navigation-menu";
import { Calendar, Menu, Play, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NavBar() {
    const [open, setOpen] = useState(false);

    const automaticScroll = (id: string) => {
        setOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    const menuItems = [
        { id: "inicio", label: "Inicio" },
        { id: "what-is", label: "Sobre" },
        { id: "tecnologias", label: "Tecnologias" },
        { id: "blog", label: "Notícias" },
        { id: "courses", label: "Cursos" },
        { id: "upcoming-events", label: "Eventos" },
        { id: "galeria", label: "Galeria" },
        { id: "footer", label: "Contato" },
    ];

    return (
        <NavigationMenu className="fixed top-0 z-4 w-full bg-white">
            <div className="relative flex h-20 items-center justify-center px-3 lg:px-12">
                <Button variant="ghost" className="flex cursor-pointer" onClick={() => automaticScroll("welcome")}>
                    <Image src="/Icone-Espaco4.0.svg" alt="Logo do Espaço 4.0" width={48} height={48} />
                    <div className="items-start flex flex-col">
                        <h1 className="text-black font-bold items-start">Espaco 4.0</h1>
                        <p className="text-gray-400 font-semibold items-center">Tecnologia & Educação</p>
                    </div>
                </Button>

                <NavigationMenuList className="hidden lg:flex gap-3">
                    {menuItems.map((item) => (
                        <NavigationMenuItem key={item.id}>
                            <NavigationMenuLink asChild>
                                <Button
                                    variant="ghost"
                                    className="cursor-pointer text-base font-normal hover:text-black/70 active:bg-gray-200/70 active:text-black"
                                    onClick={() => automaticScroll(item.id)}
                                >
                                    {item.label}
                                </Button>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>

                <Link href="#3D" className="flex text-[14px] gap-4">
                    <Play /> Ver em 3D
                </Link>
                <div className="p-3 gap-2">
                    <Link href="" className="gap-2 flex bg-amber-400 p-1 text-[14px] border rounded-xl">
                        <Calendar className="text-14px" /> Agendar Visita
                    </Link>
                </div>
                <p className="p-4 text-gray-500 ">|</p>
                <Link
                    href="/login-page"
                    className="flex lg:flex h-9 w-22 items-center justify-center rounded text-black border-2"
                >
                    <User className="gap-2" /> Entrar
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-6 lg:hidden cursor-pointer"
                    onClick={() => setOpen((prev) => !prev)}
                    aria-label="Abrir menu"
                >
                    {open ? <X /> : <Menu />}
                </Button>
            </div>

            <div
                className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${open ? "max-h-100 opacity-100" : "max-h-0 opacity-0"}
        `}
            >
                <NavigationMenuList className="flex flex-col gap-2 px-6 pb-6">
                    {menuItems.map((item) => (
                        <NavigationMenuItem key={item.id}>
                            <NavigationMenuLink asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-base text-center cursor-pointer hover:text-black/70 active:bg-gray-200/70 active:text-black"
                                    onClick={() => automaticScroll(item.id)}
                                >
                                    {item.label}
                                </Button>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    ))}

                    <Link
                        href="/login-page"
                        className="mt-4 flex h-10 items-center justify-center rounded bg-black text-white hover:bg-black/80"
                    >
                        Entrar
                    </Link>
                </NavigationMenuList>
            </div>
        </NavigationMenu>
    );
}
