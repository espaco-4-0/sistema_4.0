"use client"
import Blog from "@/ui/components/proprietary/landing_page/blog";
import { Welcome } from "@/ui/components/proprietary/landing_page/welcome";
import WhatIsSpace from "@/ui/components/proprietary/landing_page/what_is";
import { UpcomingEvents } from "@/ui/components/proprietary/landing_page/upcoming_events";

export default function Home() {
    return (
        <div>
            <Welcome/>
            <Blog/>
            <WhatIsSpace/>
            <UpcomingEvents/>
        </div>
    );
}
