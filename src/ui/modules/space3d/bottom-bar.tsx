"use client";

import { Button } from "@/src/ui/components/ui/button";
import { Info, RotateCw } from "lucide-react";
import { motion } from "motion/react";

type BottomBarProps = Readonly<{
    isRotate: boolean;
    isInfo: boolean;
    zoomLevel: number;
    onToggleRotate: () => void;
    onToggleInfo: () => void;
    onResetZoom: () => void;
}>;

const metrics = [
    { value: "40m", suffix: "2", label: "Área Total" },
    { value: "30+", label: "Equipamentos" },
    { value: "4", label: "Áreas" },
    { value: "30", label: "Pessoas" },
];

export default function BottomBar({
    isRotate,
    isInfo,
    zoomLevel,
    onToggleRotate,
    onToggleInfo,
    onResetZoom,
}: BottomBarProps) {
    const mobileControls = [
        {
            key: "rotate",
            label: "Rotação",
            onClick: onToggleRotate,
            isActive: isRotate,
            Icon: RotateCw,
        },
        {
            key: "zoom",
            label: `${zoomLevel}%`,
            onClick: onResetZoom,
            isActive: false,
            Icon: null,
        },
        {
            key: "info",
            label: "Info",
            onClick: onToggleInfo,
            isActive: isInfo,
            Icon: Info,
        },
    ];

    return (
        <div>
            <div className="hidden md:grid absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 w-fit max-w-[calc(100vw-2rem)] grid-cols-4 gap-3 sm:gap-4 rounded-xl border-[1.5] border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 md:px-8 py-3 sm:py-4">
                {metrics.map((metric) => (
                    <div key={metric.label} className="flex flex-col justify-center items-center">
                        <span className="text-yellow-primary font-bold text-lg sm:text-xl md:text-2xl">
                            {metric.value}
                            {metric.suffix ? <sup>{metric.suffix}</sup> : null}
                        </span>
                        <p className="text-slate-300/50 text-xs">{metric.label}</p>
                    </div>
                ))}
            </div>

            <div className="flex md:hidden absolute bottom-4 left-3 right-3 z-40 rounded-2xl border-[1.5] border-slate-800 bg-slate-900/80 backdrop-blur-md px-3 py-2 gap-2">
                {mobileControls.map(({ key, label, onClick, isActive, Icon }) => {
                    let variantClass = "bg-slate-800 text-white hover:bg-slate-700";

                    if (isActive) {
                        variantClass = "bg-yellow-primary text-black hover:bg-yellow-primary/90";
                    } else if (Icon) {
                        variantClass = "bg-slate-800 text-slate-400 hover:bg-slate-700";
                    }

                    return (
                        <motion.div
                            key={key}
                            className="flex-1"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <Button
                                onClick={onClick}
                                className={`w-full flex items-center justify-center gap-1.5 text-xs cursor-pointer ${variantClass}`}
                            >
                                {Icon ? <Icon size={14} /> : null}
                                <span>{label}</span>
                            </Button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
