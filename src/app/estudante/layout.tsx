"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/src/ui/components/ui/sidebar";
import StudentLeftSidebar from "@/src/ui/modules/student_pages/student_left_sidebar";
import StudentTopbar from "@/src/ui/modules/student_pages/student_topbar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <StudentLeftSidebar />
            <SidebarInset className="bg-gray-description-light/10">
                <div className="flex w-full flex-col">
                    <StudentTopbar />
                    <div className="py-3 px-3 lg:py-4 lg:px-4 2xl:py-5 2xl:px-6">{children}</div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
