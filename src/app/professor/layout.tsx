"use client";

import { Header } from "@/src/ui/modules/teacher_pages/header";
import { Sidebar } from "@/src/ui/modules/teacher_pages/sidebar";

export default function ProfessorLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
            <aside className="w-72 shrink-0 border-r bg-white">
                <Sidebar />
            </aside>

            <div className="flex flex-col flex-1 min-w-0">
                <Header />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
}
