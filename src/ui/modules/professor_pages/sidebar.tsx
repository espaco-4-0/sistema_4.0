"use client";

import {
    LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { navItems } from "@/src/infra/modules/professor/sidebar-mock";

interface SidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {

    function getLinkClasses(isActive: boolean) {
        return [
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full text-left",
            isActive
                ? "bg-[#F5C747] text-black font-semibold shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
        ].join(" ");
    }

    return (
        <aside className="fixed top-0 left-0 h-screen w-72 bg-white border-r flex flex-col z-50">
            <div className="flex-1 px-4 py-8 overflow-y-auto">
                <div className="flex items-center gap-3 px-2 mb-10">
                    <div className="relative bg-[#F5C747] w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                        <Image src="/espaco.svg" alt="Logo" width={42} height={42} className="object-contain" />
                    </div>
                    <span className="text-xl font-bold text-gray-800 tracking-tight">Espaço 4.0</span>
                </div>

                <nav className="flex flex-col gap-1.5">
                    {navItems.map((item) => {
                        const isActive = activeView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={getLinkClasses(isActive)}
                            >
                                <item.icon
                                    size={20}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={isActive ? "text-black" : "text-gray-400 group-hover:text-gray-900"}
                                />
                                <span className="text-[15px]">{item.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t mt-auto">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors group"
                >
                    <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
                    <span className="font-medium">Sair</span>
                </Link>
            </div>
        </aside>
    );
}
