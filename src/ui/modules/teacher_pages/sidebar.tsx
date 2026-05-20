"use client";

import { navItems } from "@/src/infra/modules/professor/sidebar-mock";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function getLinkClasses(isActive: boolean) {
    return [
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full text-left",
        isActive
            ? "bg-[#F5C747] text-black font-semibold shadow-sm"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
    ].join(" ");
}

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="h-full bg-white flex flex-col">
            <div className="flex-1 px-4 py-8 overflow-y-auto">
                <div className="flex items-center gap-3 px-2 mb-10">
                    <div className="relative bg-[#F5C747] w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                        <Image
                            src="/espaco.svg"
                            alt="Logo"
                            width={42}
                            height={42}
                            className="object-contain"
                            style={{ width: "auto", height: "auto" }}
                            priority
                            loading="eager"
                        />{" "}
                    </div>
                    <span className="text-xl font-bold text-gray-800 tracking-tight">Espaço 4.0</span>
                </div>

                <nav className="flex flex-col gap-1.5">
                    {navItems.map((item) => {
                        const isActive = pathname === `/professor/${item.id}`;
                        return (
                            <Link key={item.id} href={`/professor/${item.id}`} className={getLinkClasses(isActive)}>
                                <item.icon
                                    size={20}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={isActive ? "text-black" : "text-gray-400 group-hover:text-gray-900"}
                                />
                                <span className="text-[15px]">{item.name}</span>
                            </Link>
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
