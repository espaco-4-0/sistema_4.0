"use client";

import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "@/src/ui/lib/utils";
import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";

export interface CalendarDaysIconHandle {
    startAnimation: () => void;
    stopAnimation: () => void;
}

interface CalendarDaysIconProps extends HTMLAttributes<HTMLDivElement> {
    size?: number;
}

const DOTS = [
    { cx: 8, cy: 14 },
    { cx: 12, cy: 14 },
    { cx: 16, cy: 14 },
    { cx: 8, cy: 18 },
    { cx: 12, cy: 18 },
    { cx: 16, cy: 18 },
];

const VARIANTS: Variants = {
    normal: {
        opacity: 1,
    },
    animate: (i: number) => ({
        opacity: [1, 0.2, 1],
        transition: {
            delay: i * 0.1,
            duration: 0.8,
            repeat: Infinity, // LOOP INFINITO ATIVADO
            ease: "easeInOut",
        },
    }),
};

const CalendarDaysIcon = forwardRef<CalendarDaysIconHandle, CalendarDaysIconProps>(
    ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
        const controls = useAnimation();
        const isControlledRef = useRef(false);

        // Dispara a animação automaticamente ao montar o componente
        useEffect(() => {
            if (!isControlledRef.current) {
                controls.start("animate");
            }
        }, [controls]);

        useImperativeHandle(ref, () => {
            isControlledRef.current = true;
            return {
                startAnimation: () => controls.start("animate"),
                stopAnimation: () => controls.start("normal"),
            };
        });

        const handleMouseEnter = useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                if (isControlledRef.current) {
                    onMouseEnter?.(e);
                } else {
                    controls.start("animate");
                }
            },
            [controls, onMouseEnter]
        );

        const handleMouseLeave = useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                if (isControlledRef.current) {
                    onMouseLeave?.(e);
                } else {
                }
            },
            [onMouseLeave]
        );

        return (
            <div className={cn(className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
                <svg
                    fill="none"
                    height={size}
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width={size}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <rect height="18" rx="2" width="18" x="3" y="4" />
                    <path d="M3 10h18" />
                    {DOTS.map((dot, index) => (
                        <motion.circle
                            animate={controls}
                            custom={index}
                            cx={dot.cx}
                            cy={dot.cy}
                            fill="currentColor"
                            initial="normal"
                            key={`${dot.cx}-${dot.cy}`}
                            r="1"
                            stroke="none"
                            variants={VARIANTS}
                        />
                    ))}
                </svg>
            </div>
        );
    }
);

CalendarDaysIcon.displayName = "CalendarDaysIcon";

export { CalendarDaysIcon };
