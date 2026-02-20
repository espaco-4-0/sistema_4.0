"use client";

import Blog from "../ui/modules/landing_page/blog";
import ComeAndDiscover from "../ui/modules/landing_page/come_and_discover";
import CoursesAndTraining from "../ui/modules/landing_page/courses_and_training";
import Footer from "../ui/modules/landing_page/footer";
import NavBar from "../ui/modules/landing_page/navbar";
import { UpcomingEvents } from "../ui/modules/landing_page/upcoming_events";
import { Welcome } from "../ui/modules/landing_page/welcome";
import WhatIsSpace from "../ui/modules/landing_page/what_is";

export default function Home() {
    return (
        <div>
            <Welcome />
            <NavBar />
            <Blog />
            <WhatIsSpace />
            <CoursesAndTraining />
            <UpcomingEvents />
            <ComeAndDiscover />
            <Footer />
        </div>
    );
}
