import { motion } from "framer-motion";
import { Box, Eye, MousePointer2 } from "lucide-react";
import Image from "next/image";

const listItems = [
    "Visualização 360° de todos os ambientes",
    "Conheça cada tecnologia disponível",
    "Veja projetos reais em exposição",
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.15 },
    },
};

const fadeLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const fadeRight = {
    hidden: { opacity: 0, x: 40, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const fadeItem = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export default function Viewer3dSection() {
    return (
        <section
            id="viewer_3d_section"
            className="py-32 bg-linear-to-r from-black via-slate-900 to-slate-800 relative overflow-hidden"
        >
            <motion.div
                className="absolute top-1/4 left-10 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    {/* Coluna esquerda — texto - ass:Guga */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <motion.div
                            variants={fadeLeft}
                            className="inline-flex items-center px-4 gap-2 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full mb-6"
                        >
                            <Eye className="h-4 w-4 text-yellow-400" />
                            <span className="text-yellow-400 text-sm font-semibold">Tour Virtual</span>
                        </motion.div>

                        <motion.h2 variants={fadeLeft} className="text-4xl md:text-6xl font-bold text-white mb-6">
                            Explore o Espaço 4.0 <span className="text-yellow-400"> em 3D!</span>
                        </motion.h2>

                        <motion.p variants={fadeLeft} className="text-xl text-slate-300 mb-8 leading-relaxed">
                            Faça um tour virtual completo pelo nosso espaço. Navegue pelos ambientes, conheça os
                            equipamentos e visualize como suas aulas podem acontecer aqui.
                        </motion.p>

                        <motion.ul variants={containerVariants} className="space-y-4 mb-10">
                            {listItems.map((item) => (
                                <motion.li
                                    key={item}
                                    variants={fadeItem}
                                    className="flex items-center gap-3 text-slate-300"
                                >
                                    <motion.div
                                        className="w-2 h-2 bg-yellow-400 rounded-full shrink-0"
                                        animate={{ scale: [1, 1.4, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                    {item}
                                </motion.li>
                            ))}
                        </motion.ul>

                        <motion.button
                            variants={fadeLeft}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            className="group px-10 py-5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl transition-colors duration-300 flex items-center gap-3 shadow-2xl hover:shadow-yellow-400/30 cursor-pointer"
                        >
                            <Box className="w-6 h-6 group-hover:rotate-360 transition-transform duration-700" />
                            Iniciar Tour Virtual
                            <MousePointer2 className="w-5 h-5  group-hover:rotate-360 transition-transform duration-700" />
                        </motion.button>
                    </motion.div>

                    <motion.div
                        variants={fadeRight}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-linear-to-br from-yellow-400/20 to-blue-400/10 blur-3xl -z-10 scale-150 rounded-full" />

                        <div className="relative bg-linear-to-br from-slate-900 to-black rounded-3xl p-8 border border-slate-700/60 shadow-2xl">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>

                            {/* --Futuramente local onde colocaremmos o video real do espaco em 3D Coluna Direita ass: guga-- */}
                            <motion.div
                                className="aspect-video bg-slate-950 rounded-xl overflow-hidden relative group/img"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Image
                                    src="/espaco-externo.png"
                                    alt="Espaço 4.0 — vista externa"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover group-hover/img:scale-105 transition-transform duration-700"
                                />

                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Box className="w-12 h-12 text-yellow-400 drop-shadow-lg" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
