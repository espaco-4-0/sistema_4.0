import { Card, CardContent, CardDescription, CardTitle } from "@/src/ui/components/ui/card";
import { Easing, motion } from "framer-motion";
import { BookOpen, Medal, Shell, Users } from "lucide-react";
import Image from "next/image";

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" as Easing, delay: i * 0.12 },
    }),
};

const statVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" as Easing, delay: i * 0.15 },
    }),
};

export default function WhatIsSpace() {
    return (
        <section id="what-is" className="bg-[#F9FAFB] py-28">
            <div className="max-w-7xl mx-auto px-6">
                <div className="justify-center items-center text-center flex flex-col mb-16">
                    <h2 className="font-semibold text-5xl">
                        O que é o <span className="text-yellow-muted font-semibold">Espaço 4.0 ?</span>
                    </h2>

                    <p className="text-xl text-gray-700  max-w-3xl pt-5">
                        Um Laboratorio maker equipado com tecnologias de ponta para promover inovação, prototipagem e
                        desenvolvimento de projetos da indústria 4.0
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 hover:cursor-default gap-6 mb-24">
                    <motion.div
                        custom={0}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={cardVariants}
                        className="h-full"
                    >
                        <Card className="flex flex-col items-start p-4 gap-3 text-start transition-all duration-300 h-full">
                            <CardTitle className="bg-yellow-500 h-15 w-15 flex justify-center shadow-lg rounded-xl items-center">
                                <Shell className="h-max w-max text-black" />
                            </CardTitle>

                            <CardContent className="font-semibold text-[18px] items-start text-start justify-around flex p-1">
                                Gestão de Projetos
                            </CardContent>

                            <CardDescription className="px-1 py-1text-[15px] items-start text-start flex">
                                Acompanhe e gerencie todos os projetos em desenvolvimento no espaço maker
                            </CardDescription>
                        </Card>
                    </motion.div>

                    <motion.div
                        custom={1}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={cardVariants}
                        className="h-full"
                    >
                        <Card className="flex flex-col items-start p-4 gap-3 text-start transition-all duration-300 h-full">
                            <CardTitle className="bg-yellow-500 h-15 w-15 flex justify-center shadow-lg rounded-xl items-center">
                                <Users className="h-max w-max text-black" />
                            </CardTitle>

                            <CardContent className="font-semibold text-[18px] items-start text-start justify-around flex p-1">
                                Controle de Acesso
                            </CardContent>

                            <CardDescription className="px-1 py-1 text-[15px] items-start text-start flex">
                                Sistema integrado para gerenciar usuários e permissões de acesso
                            </CardDescription>
                        </Card>
                    </motion.div>

                    <motion.div
                        custom={2}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={cardVariants}
                        className="h-full"
                    >
                        <Card className="flex flex-col items-start p-4 gap-3 text-start transition-all duration-300 h-full">
                            <CardTitle className="bg-yellow-500 h-15 w-15 flex justify-center shadow-lg rounded-xl items-center">
                                <BookOpen className="h-max w-max text-black" />
                            </CardTitle>

                            <CardContent className="font-semibold text-[18px] items-start text-start justify-around flex p-1">
                                Reserva de Equipamento
                            </CardContent>

                            <CardDescription className="px-1 py-1 text-[15px] items-start text-start flex">
                                Reserve impressoras 3D, ferramentas e equipamentos de forma simples
                            </CardDescription>
                        </Card>
                    </motion.div>

                    <motion.div
                        custom={3}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={cardVariants}
                        className="h-full"
                    >
                        <Card className="flex flex-col items-start p-4 gap-3 text-start transition-all duration-300 h-full">
                            <CardTitle className="bg-yellow-500 h-15 w-15 flex justify-center shadow-lg rounded-xl border items-center">
                                <Medal className="h-max w-max text-black" />
                            </CardTitle>

                            <CardContent className="font-semibold text-[18px] items-start text-start justify-around flex p-1">
                                Gestão de Projetos
                            </CardContent>

                            <CardDescription className="px-1 py-1 text-[15px] items-start text-start flex">
                                Acesso a treinamentos e cursos sobre tecnologias da indústria 4.0
                            </CardDescription>
                        </Card>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="group relative h-105 rounded-xl overflow-hidden shadow-lg">
                        <Image
                            src="/espaco-interior.jpeg"
                            alt="Imagem do interior do Espaço 4.0"
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                            className="object-cover transition-transform duration-10000 group-hover:scale-110"
                        />
                    </div>

                    <div className="flex flex-col gap-6">
                        <h2 className="text-4xl flex font-bold items-center gap-2">
                            <span className="text-yellow-primary font-bold">|</span>
                            <span className="text-black">Sobre o</span>
                            <span className="text-yellow-muted">Espaço 4.0</span>
                        </h2>
                        <div className="text-[#4A5565] text-base leading-relaxed space-y-4">
                            <p>
                                O Espaço 4.0 é um laboratório de inovação do{" "}
                                <span className="font-bold"> Instituto Federal de Alagoas - Campus Arapiraca </span>,
                                dedicado a promover o desenvolvimento de competências em tecnologias da quarta revolução
                                industrial.
                            </p>

                            <p>
                                Com infraestrutura moderna e equipamentos de ponta, oferecemos aos estudantes e à
                                comunidade um ambiente propício para materializar ideias, desenvolver protótipos e criar
                                soluções inovadoras.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center mt-24">
                                <motion.div
                                    custom={0}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.4 }}
                                    variants={statVariants}
                                    whileHover={{ scale: 1.1 }}
                                    className="flex flex-col items-center cursor-default"
                                >
                                    <span className="bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent text-4xl font-semibold">
                                        500+
                                    </span>
                                    <span className="text-[#4A5565] text-lg mt-2">Usuarios Ativos</span>
                                </motion.div>
                                <motion.div
                                    custom={1}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.4 }}
                                    variants={statVariants}
                                    whileHover={{ scale: 1.1 }}
                                    className="flex flex-col items-center cursor-default"
                                >
                                    <span className="bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent text-4xl font-semibold">
                                        150+
                                    </span>
                                    <span className="text-[#4A5565] text-lg mt-2">Projetos Concluidos</span>
                                </motion.div>
                                <motion.div
                                    custom={2}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.4 }}
                                    variants={statVariants}
                                    whileHover={{ scale: 1.1 }}
                                    className="flex flex-col items-center cursor-default"
                                >
                                    <span className="bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent text-4xl font-semibold">
                                        50+
                                    </span>
                                    <span className="text-[#4A5565] text-lg mt-2">Equipamentos</span>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
