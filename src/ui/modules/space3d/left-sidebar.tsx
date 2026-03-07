"use client";

import { Button } from "@/src/ui/components/ui/button";
import { Separator } from "@/src/ui/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/src/ui/components/ui/toggle-group";
import { Info, RotateCw, ZoomIn, ZoomOut, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

type LeftSidebarProps = Readonly<{
    isRotate: boolean;
    isInfo: boolean;
    zoomLevel: number;
    onFrontView: () => void;
    onSideView: () => void;
    onTopView: () => void;
    onIsometricView: () => void;
    onZoomOut: () => void;
    onResetZoom: () => void;
    onZoomIn: () => void;
    onRotateChange: (value: boolean) => void;
    onInfoChange: (value: boolean) => void;
}>;

type PresetView = Readonly<{
    key: string;
    label: string;
    onClick: () => void;
}>;

type ZoomControl = Readonly<{
    key: string;
    onClick: () => void;
    icon?: LucideIcon;
    label?: string;
    ariaLabel: string;
}>;

type OptionControl = Readonly<{
    value: string;
    label: string;
    shortcut: string;
    icon: LucideIcon;
    isActive: boolean;
}>;

type KeyboardShortcut = Readonly<{
    key: string;
    label: string;
}>;

type AnimatedItemProps = Readonly<{
    children: ReactNode;
    className?: string;
}>;

function AnimatedItem({ children, className = "w-full" }: AnimatedItemProps) {
    return (
        <motion.div className={className} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            {children}
        </motion.div>
    );
}

export default function LeftSidebar({
    isRotate,
    isInfo,
    zoomLevel,
    onFrontView,
    onSideView,
    onTopView,
    onIsometricView,
    onZoomOut,
    onResetZoom,
    onZoomIn,
    onRotateChange,
    onInfoChange,
}: LeftSidebarProps) {
    const presetViews: PresetView[] = [
        { key: "front", label: "Frontal", onClick: onFrontView },
        { key: "side", label: "Lateral", onClick: onSideView },
        { key: "top", label: "Superior", onClick: onTopView },
        { key: "isometric", label: "Isométrica", onClick: onIsometricView },
    ];

    const zoomControls: ZoomControl[] = [
        {
            key: "zoom-out",
            onClick: onZoomOut,
            icon: ZoomOut,
            ariaLabel: "Diminuir zoom",
        },
        {
            key: "reset-zoom",
            onClick: onResetZoom,
            label: `${zoomLevel}%`,
            ariaLabel: "Redefinir zoom",
        },
        {
            key: "zoom-in",
            onClick: onZoomIn,
            icon: ZoomIn,
            ariaLabel: "Aumentar zoom",
        },
    ];

    const optionControls: OptionControl[] = [
        {
            value: "rotate",
            label: "Auto-Rotação",
            shortcut: "(R)",
            icon: RotateCw,
            isActive: isRotate,
        },
        {
            value: "info",
            label: "Informações",
            shortcut: "(I)",
            icon: Info,
            isActive: isInfo,
        },
    ];

    const keyboardShortcuts: KeyboardShortcut[] = [
        { key: "+/-", label: "Zoom" },
        { key: "R", label: "Auto-Rotação" },
        { key: "I", label: "Informações" },
        { key: "0", label: "Resetar" },
    ];

    return (
        <div className="hidden md:flex md:w-60 p-4 bg-slate-900/80 backdrop-blur-md border-[1.5px] rounded-2xl border-slate-800 absolute top-24 left-4 md:left-6 bottom-6 z-40 flex-col gap-5 overflow-y-auto">
            <h2 className="text-white font-semibold text-sm md:text-base">Controles</h2>

            <div>
                <h3 className="text-slate-200/60 text-xs mb-1.5">Vistas Predefinidas</h3>
                <div className="flex flex-col gap-2">
                    {presetViews.map(({ key, label, onClick }) => (
                        <AnimatedItem key={key}>
                            <Button
                                onClick={onClick}
                                className="bg-slate-800 cursor-pointer hover:bg-slate-700 w-full text-xs md:text-sm"
                            >
                                {label}
                            </Button>
                        </AnimatedItem>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-slate-200/60 text-xs mb-1.5">Zoom</h3>
                <div className="grid grid-cols-3 gap-2">
                    {zoomControls.map(({ key, icon: Icon, label, onClick, ariaLabel }) => (
                        <AnimatedItem key={key}>
                            <Button
                                className="bg-slate-800 hover:bg-slate-700 cursor-pointer w-full text-xs"
                                onClick={onClick}
                                aria-label={ariaLabel}
                            >
                                {Icon ? <Icon size={16} /> : label}
                            </Button>
                        </AnimatedItem>
                    ))}
                </div>
            </div>

            <div className="flex flex-col">
                <h3 className="text-slate-200/60 text-xs mb-1.5">Opções</h3>
                <ToggleGroup
                    type="multiple"
                    orientation="vertical"
                    spacing={1}
                    value={[...(isRotate ? ["rotate"] : []), ...(isInfo ? ["info"] : [])]}
                    onValueChange={(values) => {
                        onRotateChange(values.includes("rotate"));
                        onInfoChange(values.includes("info"));
                    }}
                    className="flex flex-col gap-3.5 w-full"
                >
                    {optionControls.map(({ value, label, shortcut, icon: Icon, isActive }) => (
                        <AnimatedItem key={value}>
                            <ToggleGroupItem
                                className="w-full flex justify-between cursor-pointer bg-slate-800 hover:bg-slate-700 text-xs selection:bg-yellow-primary"
                                value={value}
                            >
                                <span
                                    className={`flex gap-2 items-center ${isActive ? "text-black" : "text-slate-400"}`}
                                >
                                    <Icon size={16} /> {label}
                                </span>
                                <span className={isActive ? "text-black" : "text-slate-400"}>{shortcut}</span>
                            </ToggleGroupItem>
                        </AnimatedItem>
                    ))}
                </ToggleGroup>
            </div>

            <Separator className="bg-slate-600" />

            <div className="text-white flex flex-col gap-2">
                <h3 className="text-slate-200/60 text-xs mb-1">Atalhos do teclado</h3>
                {keyboardShortcuts.map(({ key, label }) => (
                    <div key={key} className="flex justify-between text-xs">
                        <span className="text-slate-300/50">{key}</span>
                        <span className="text-slate-100/70">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
