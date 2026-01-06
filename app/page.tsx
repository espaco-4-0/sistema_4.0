"use client"
import Blog from "@/ui/components/proprietary/landing_page/blog";
import { Welcome } from "@/ui/components/proprietary/landing_page/welcome";
import WhatIsSpace from "@/ui/components/proprietary/landing_page/what_is";
import { UpcomingEvents } from "@/ui/components/proprietary/landing_page/upcoming_events";
import ComeAndDiscover from "@/ui/components/proprietary/landing_page/come_and_discover";
import CoursesAndTraining from "@/ui/components/proprietary/landing_page/courses_and_training";
import Footer from "@/ui/components/proprietary/landing_page/footer";
import NavBar from "@/ui/components/proprietary/landing_page/navbar";

export default function Home() {
    return (
        <div>
            <NavBar/>
            <Welcome/>
            <Blog/>
            <WhatIsSpace/>
            <CoursesAndTraining/>
            <UpcomingEvents/>
            <ComeAndDiscover/>
            <Footer/>
        </div>
    );
}
