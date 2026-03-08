"use client";

import type { ReactNode } from "react";
import { Separator } from "@/src/ui/components/ui/separator";

const equipmentItems = [
    "5 Impressoras 3D profissionais",
    "10 Headsets VR/AR",
    "15 Kits de robótica",
    "Lab de eletrônica completo",
    "20 Computadores de alta performance",
] as const;

const featureItems = ["Climatização completa", "Iluminação LED inteligente", "Internet de alta velocidade"] as const;

const containerDetails: ReadonlyArray<{
    label: string;
    value: string;
    suffix?: ReactNode;
}> = [
    { label: "Dimensões Externas", value: "12m x 8m x 2.5m" },
    { label: "Área Útil", value: "40m", suffix: <sup key="area-suffix">2</sup> },
    { label: "Capacidade", value: "30 pessoas" },
];

const desktopContainerClassName =
    "hidden md:flex absolute w-60 p-4 bg-slate-900/80 backdrop-blur-md border-[1.5px] rounded-2xl border-slate-800 right-4 md:right-6 top-24 bottom-6 z-40 flex-col gap-5 overflow-y-auto";

const mobileContainerClassName =
    "flex md:hidden flex-col absolute inset-x-3 top-24 bottom-20 z-40 p-4 bg-slate-900/90 backdrop-blur-md border-[1.5px] rounded-2xl border-slate-800 gap-5 overflow-y-auto";

function InfoList({
    textClassName,
}: Readonly<{
    textClassName: string;
}>) {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4">
                {containerDetails.map(({ label, value, suffix }) => (
                    <div key={label}>
                        <h4 className="text-slate-200/60 text-[10px] mb-1.5">{label}</h4>
                        <p className={textClassName}>
                            {value}
                            {suffix ?? null}
                        </p>
                    </div>
                ))}
            </div>

            <Separator className="bg-slate-600" />

            <div>
                <h4 className="text-slate-200/60 text-[10px] mb-1.5">Equipamentos Internos</h4>
                <ul className="flex flex-col gap-1.5 list-disc list-inside marker:text-yellow-primary">
                    {equipmentItems.map((item) => (
                        <li key={item} className={textClassName}>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            <Separator className="bg-slate-600" />

            <div>
                <h4 className="text-slate-200/60 text-[10px] mb-1.5">Características</h4>
                <ul className="flex flex-col gap-1.5 list-disc list-inside marker:text-yellow-primary">
                    {featureItems.map((item) => (
                        <li key={item} className={textClassName}>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default function RightSidebar() {
    return (
        <>
            <div className={desktopContainerClassName}>
                <h3 className="text-white font-semibold text-xs md:text-sm">Informações do Container</h3>
                <InfoList textClassName="text-white text-[10px] md:text-xs" />
            </div>

            <div className={mobileContainerClassName}>
                <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-sm">Informações do Container</h3>
                </div>

                <InfoList textClassName="text-white text-xs" />
            </div>
        </>
    );
}
