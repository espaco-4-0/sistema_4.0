"use client";

import Blog from "../ui/modules/landing_page/blog";
import ComeAndDiscover from "../ui/modules/landing_page/come_and_discover";
import CoursesAndTraining from "../ui/modules/landing_page/courses_and_training";
import Footer from "../ui/modules/landing_page/footer";
import { Hero } from "../ui/modules/landing_page/hero";
import NavBar from "../ui/modules/landing_page/navbar";
import SpaceGallery from "../ui/modules/landing_page/space_gallery";
import { UpcomingEvents } from "../ui/modules/landing_page/upcoming_events";
import Viewer3dSection from "../ui/modules/landing_page/viewer_3d_section";
import WhatIsSpace from "../ui/modules/landing_page/what_is";

export default function Home() {
    return (
        <div>
            <NavBar />
            <Hero />
            <Blog />
            <WhatIsSpace />
            <CoursesAndTraining />
            <UpcomingEvents />
            <ComeAndDiscover />
            <SpaceGallery />
            <Footer />
            <Viewer3dSection />
        </div>
    );
}
