import { Button } from "@/src/ui/components/ui/button";
import { motion, type Variants } from "framer-motion";
import { Calendar, FolderOpen, MouseIcon, Play } from "lucide-react";

const buttonVariants: Variants = { hover: { scale: 1.05 } };
const iconVariants: Variants = { hover: { rotate: 360 } };

const fadeUp = (delay: number): Variants => ({
    hidden: { opacity: 0, y: 40 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: "easeOut", delay },
    },
});

export function Hero() {
    return (
        <section
            id="welcome"
            className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-r from-black via-slate-800 to-slate-800 px-4"
        >
            <motion.div
                className="absolute inset-0 bg-[url('/espaco-externo.png')] bg-cover bg-center"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 0.25, scale: 1 }}
                transition={{ duration: 1.4, ease: "easeOut" }}
            />

            <div className="relative z-10 flex flex-col items-center text-center">
                <motion.div className="mb-8" variants={fadeUp(0.1)} initial="hidden" animate="show">
                    <span className="px-5 py-2.5 bg-yellow-400 text-slate-900 text-sm font-semibold rounded-full tracking-wide">
                        Inovação na Educação
                    </span>
                </motion.div>

                <motion.h1
                    className="text-6xl md:text-8xl font-bold text-white"
                    variants={fadeUp(0.25)}
                    initial="hidden"
                    animate="show"
                >
                    Espaço <span className="text-yellow-400">4.0</span>
                </motion.h1>

                <motion.p
                    className="mt-5 text-2xl md:text-3xl font-normal text-yellow-50 max-w-2xl"
                    variants={fadeUp(0.4)}
                    initial="hidden"
                    animate="show"
                >
                    Tecnologia, Educação e Inovação na prática
                </motion.p>

                <motion.p
                    className="mt-6 text-yellow-100 text-lg md:text-xl max-w-3xl leading-relaxed"
                    variants={fadeUp(0.55)}
                    initial="hidden"
                    animate="show"
                >
                    Um ambiente de aprendizado imersivo onde estudantes exploram impressão 3D, realidade virtual,
                    robótica e muito mais.
                </motion.p>

                <motion.div
                    className="mt-12 flex flex-wrap justify-center gap-4"
                    variants={fadeUp(0.7)}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div whileHover="hover" whileTap={{ scale: 0.97 }} variants={buttonVariants}>
                        <Button
                            size="lg"
                            className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer text-base px-6"
                        >
                            <motion.span
                                variants={iconVariants}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="inline-flex"
                            >
                                <Play className="h-5 w-5" />
                            </motion.span>
                            Ver o Espaço em 3D
                        </Button>
                    </motion.div>
                    <motion.div whileHover="hover" whileTap={{ scale: 0.97 }} variants={buttonVariants}>
                        <Button
                            size="lg"
                            className="bg-white text-black hover:bg-gray-50 cursor-pointer text-base px-6"
                        >
                            <motion.span
                                variants={iconVariants}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="inline-flex"
                            >
                                <Calendar className="h-5 w-5" />
                            </motion.span>
                            Agendar Visita
                        </Button>
                    </motion.div>
                    <motion.div whileHover="hover" whileTap={{ scale: 0.97 }} variants={buttonVariants}>
                        <Button
                            size="lg"
                            className="border-white border bg-white/10 hover:bg-white/20 backdrop-blur-sm cursor-pointer text-white text-base px-6"
                        >
                            <motion.span
                                variants={iconVariants}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="inline-flex"
                            >
                                <FolderOpen className="h-5 w-5" />
                            </motion.span>
                            Ver projetos
                        </Button>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="flex flex-col items-center gap-2 pt-16 text-slate-400"
                    variants={fadeUp(0.85)}
                    initial="hidden"
                    animate="show"
                >
                    <span className="text-sm tracking-widest uppercase">Explore mais</span>
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <MouseIcon className="text-white opacity-50 h-9 w-9" />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
