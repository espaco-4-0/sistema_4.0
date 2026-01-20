"use client";

import { useEffect, useState } from "react";

import LoadingCat from "../loading";

export default function SlowPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 10000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return <LoadingCat />;

    return (
        <div>
            <h1 className="text-2xl flex">Página Pronta</h1>
        </div>
    );
}
