"use client";

import { useEffect, useState } from "react";
import BlogNews from "@/src/ui/modules/blog_pages/blog_news";

import Loading from "../loading";

export default function Blog() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return <Loading />;

    return (
        <div>
            <BlogNews />
        </div>
    );
}
