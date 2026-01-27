"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/src/ui/components/ui/sidebar";
import StudentLeftSidebar from "@/src/ui/modules/student_pages/student_left_sidebar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <StudentLeftSidebar />
            <SidebarInset className="bg-gray-description-light/10">{children}</SidebarInset>
            {/*<SidebarTrigger className="bg-red-500 w-10 h-10">fechar</SidebarTrigger>*/}
        </SidebarProvider>
    );
}
