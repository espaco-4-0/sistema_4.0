"use client";

import { useRouter } from "next/navigation";

import { Button } from "../../components/ui/button";

interface BlogCardsProps {
    slug: string;
    title: string;
    category: string;
    image: string;
    size?: "small" | "large";
}

export default function BlogCards({ slug, category, title, image, size = "small" }: BlogCardsProps) {
    const router = useRouter();
    const isLarge = size === "large";

    return (
        <Button
            onClick={() => router.push(`/blog/${slug}`)}
            className={`relative rounded-2xl overflow-hidden group cursor-pointer ${isLarge ? "h-117.5" : "h-55"}`}
        >
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className={`absolute bottom-0 left-0 right-0 p-6 text-white ${isLarge ? "p-8" : ""}`}>
                <p className="text-sm uppercase tracking-wider mb-2 opacity-90">{category}</p>
                <h3 className={`${isLarge ? "text-3xl" : "text-lg"}`}>{title}</h3>
            </div>
        </Button>
    );
}
