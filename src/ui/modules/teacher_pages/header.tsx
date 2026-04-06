"use client";

import { viewTitles } from "@/src/infra/modules/professor/header-mock";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const currentView = pathname.split("/").pop() || "visao-geral";
    const { title, subtitle } = viewTitles[currentView] || viewTitles["visao-geral"];
    const userName = session?.user?.name ?? session?.user?.email ?? "Usuário";
    const userImage = session?.user?.image;
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 ml-2">
                        {userImage ? (
                            <img src={userImage} alt={userName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold">
                                {userInitial}
                            </div>
                        )}
                        <span className="text-sm font-medium">{userName}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
