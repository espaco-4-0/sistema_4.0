"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EyeOff } from "lucide-react";

type BlurCardProps = {
    isBlur: boolean;
    onToggle: () => void;
    children: React.ReactNode;
};

export const BlurCard = ({ isBlur, onToggle, children }: BlurCardProps) => {
    return (
        <div className="relative w-full mt-6">
            <motion.div
                animate={{ filter: isBlur ? "blur(4px)" : "blur(0px)" }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className={isBlur ? "select-none pointer-events-none" : ""}
            >
                {children}
            </motion.div>

            <AnimatePresence>
                {isBlur && (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 flex items-center justify-center z-10"
                    >
                        <motion.button
                            type="button"
                            onClick={onToggle}
                            initial={{ opacity: 0, scale: 0.9, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 6 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex flex-col items-center gap-2 bg-white rounded-xl shadow-lg px-6 py-5 cursor-pointer border border-gray-100"
                            aria-label="Revelar informações"
                        >
                            <div className="flex items-center justify-center size-11 rounded-full bg-yellow-400">
                                <EyeOff className="size-5 text-black" strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col items-center gap-0.5 text-center">
                                <span className="text-sm font-semibold text-gray-800">Conteúdo Sensível</span>
                                <span className="text-xs text-gray-500">
                                    Clique em &ldquo;Mostrar Dados&rdquo; para visualizar
                                </span>
                            </div>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
