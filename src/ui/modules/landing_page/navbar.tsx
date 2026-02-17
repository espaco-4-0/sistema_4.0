"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/ui/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@radix-ui/react-navigation-menu";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Menu, Play, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NavBar() {
    const [open, setOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hero = document.getElementById("welcome");

        if (!hero) {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                const shouldShow = !entry.isIntersecting;
                setIsVisible(shouldShow);

                if (!shouldShow) {
                    setOpen(false);
                }
            },
            { threshold: 0.2 }
        );

        observer.observe(hero);

        return () => {
            observer.disconnect();
        };
    }, []);

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
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed top-0 z-20 w-full"
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                >
                    <NavigationMenu className="w-full bg-white">
                        <div className="relative mx-auto flex h-20 max-w-6xl items-center gap-6 px-4 lg:px-8">
                            <Button
                                variant="ghost"
                                className="flex items-center gap-3 p-0 cursor-pointer shrink-0"
                                onClick={() => automaticScroll("welcome")}
                            >
                                <Image src="/Icone-Espaco4.0.svg" alt="Logo do Espaço 4.0" width={48} height={48} />
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="text-base font-bold text-black leading-none">Espaco 4.0</span>
                                    <span className="text-xs font-semibold text-gray-400 leading-none">
                                        Tecnologia & Educação
                                    </span>
                                </div>
                            </Button>

                            <NavigationMenuList className="mx-auto hidden lg:flex flex-1 items-center justify-center gap-4 min-w-0">
                                {menuItems.map((item) => (
                                    <NavigationMenuItem key={item.id}>
                                        <NavigationMenuLink asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-9 cursor-pointer px-2 text-[13px] font-medium text-black/70 hover:text-black active:bg-gray-200/70 active:text-black whitespace-nowrap"
                                                onClick={() => automaticScroll(item.id)}
                                            >
                                                {item.label}
                                            </Button>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>

                            <div className="ml-auto hidden lg:flex shrink-0 items-center gap-4">
                                <Link
                                    href="#3D"
                                    className="flex items-center gap-2 text-[13px] font-semibold text-black/70 hover:text-black whitespace-nowrap"
                                >
                                    <Play className="h-5 w-5" /> Ver em 3D
                                </Link>
                                <Link
                                    href=""
                                    className="flex h-9 items-center gap-2 rounded-sm bg-yellow-400 px-3 text-[13px] font-semibold text-black hover:bg-yellow-300 whitespace-nowrap"
                                >
                                    <Calendar className="h-5 w-5" /> Agendar Visita
                                </Link>
                                <div className="h-6 w-px bg-gray-300" />
                                <Link
                                    href="/login-page"
                                    className="flex h-9 items-center justify-center gap-2 rounded-sm border-2 border-gray-300 px-3 text-[13px] font-semibold text-black whitespace-nowrap"
                                >
                                    <User className="h-5 w-5" /> Entrar
                                </Link>
                            </div>
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

                        <AnimatePresence initial={false}>
                            {open && (
                                <motion.div
                                    className="lg:hidden overflow-hidden"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <NavigationMenuList className="flex flex-col gap-2 px-6 pb-6">
                                        {menuItems.map((item) => (
                                            <NavigationMenuItem key={item.id}>
                                                <NavigationMenuLink asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-10 w-full justify-start text-base text-center cursor-pointer text-black/70 hover:text-black active:bg-gray-200/70 active:text-black"
                                                        onClick={() => automaticScroll(item.id)}
                                                    >
                                                        {item.label}
                                                    </Button>
                                                </NavigationMenuLink>
                                            </NavigationMenuItem>
                                        ))}

                                        <div className="mt-4 flex flex-col gap-2">
                                            <Link
                                                href="#3D"
                                                className="flex h-10 items-center justify-center gap-2 rounded-sm border border-gray-300 text-sm font-semibold text-black"
                                            >
                                                <Play className="h-5 w-5" /> Ver em 3D
                                            </Link>
                                            <Link
                                                href=""
                                                className="flex h-10 items-center justify-center gap-2 rounded-sm bg-yellow-400 text-sm font-semibold text-black"
                                            >
                                                <Calendar className="h-5 w-5" /> Agendar Visita
                                            </Link>
                                            <Link
                                                href="/login-page"
                                                className="flex h-10 items-center justify-center gap-2 rounded-sm border border-gray-300 text-sm font-semibold text-black"
                                            >
                                                <User className="h-5 w-5" /> Entrar
                                            </Link>
                                        </div>
                                    </NavigationMenuList>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </NavigationMenu>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
