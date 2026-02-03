import { Card, CardContent, CardDescription, CardTitle } from "@/src/ui/components/ui/card";
import { BookOpen, Medal, Shell, Users } from "lucide-react";
import Image from "next/image";

export default function WhatIsSpace() {
    return (
        <section id="what-is" className="bg-[#F9FAFB] py-28">
            <div className="max-w-7xl mx-auto px-6">
                <div className="justify-center items-center text-center flex flex-col mb-16">
                    <h2 className="font-semibold text-4xl">
                        O que e o <span className="text-yellow-muted font-semibold">Espaço 4.0 ?</span>
                    </h2>

                    <p className="text-xl text-gray-700 mt-6 max-w-3xl pt-8">
                        Um Laboratorio maker equipado com tecnologias de ponta para promover inovação, prototipagem e
                        desenvolvimento de projetos da indústria 4.0
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 hover:cursor-default gap-6 mb-24">
                    <Card className="flex flex-col items-center text-center transition-all duration-300">
                        <CardTitle className="bg-yellow-back-icon h-15 w-15 flex justify-center rounded-full items-center">
                            <Shell className="text-yellow-icon h-max w-max" />
                        </CardTitle>

                        <CardContent className="font-semibold text-[18px]">Gestão de Projetos</CardContent>

                        <CardDescription className="px-3 text-[13px]">
                            Acompanhe e gerencie todos os projetos em desenvolvimento no espaço maker
                        </CardDescription>
                    </Card>

                    <Card className="flex flex-col items-center text-center transition-all duration-300">
                        <CardTitle className="bg-yellow-back-icon h-15 w-15 flex justify-center rounded-full items-center">
                            <Users className="h-max w-max text-yellow-icon" />
                        </CardTitle>

                        <CardContent className="font-semibold text-[18px]">Controle de Acesso</CardContent>

                        <CardDescription className="px-3 text-[13px]">
                            Sistema integrado para gerenciar usuários e permissões de acesso
                        </CardDescription>
                    </Card>

                    <Card className="flex flex-col items-center text-center transition-all duration-300">
                        <CardTitle className="bg-yellow-back-icon h-15 w-15 flex justify-center rounded-full items-center">
                            <BookOpen className="h-max w-max text-yellow-icon" />
                        </CardTitle>

                        <CardContent className="font-semibold text-[18px]">Reserva de Equipamento</CardContent>

                        <CardDescription className="px-3 text-[13px]">
                            Reserve impressoras 3D, ferramentas e equipamentos de forma simples
                        </CardDescription>
                    </Card>

                    <Card className="flex flex-col items-center text-center transition-all duration-300">
                        <CardTitle className="bg-yellow-back-icon h-15 w-15 flex justify-center rounded-full items-center">
                            <Medal className="h-max w-max text-yellow-icon" />
                        </CardTitle>

                        <CardContent className="font-semibold text-[18px]">Gestão de Projetos</CardContent>

                        <CardDescription className="px-3 text-[13px]">
                            Acesso a treinamentos e cursos sobre tecnologias da indústria 4.0
                        </CardDescription>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="group relative h-105 rounded-xl overflow-hidden shadow-lg">
                        <Image
                            src="/espaco-interior.jpeg"
                            alt="Imagem do interior do Espaço 4.0"
                            fill
                            priority
                            className="object-cover transition-transform duration-10000 group-hover:scale-110"
                        />
                    </div>

                    <div className="flex flex-col gap-6">
                        <h2 className="text-2xl flex font-medium items-center gap-2">
                            <span className="text-yellow-primary font-bold">|</span>
                            <span className="text-black">Sobre o</span>
                            <span className="text-yellow-muted">Espaço 4.0</span>
                        </h2>
                        <div className="text-[#4A5565] text-base leading-relaxed space-y-4">
                            <p>
                                O Espaço 4.0 é um laboratório de inovação do Instituto Federal de Alagoas - Campus
                                Arapiraca, dedicado a promover o desenvolvimento de competências em tecnologias da
                                quarta revolução industrial.
                            </p>

                            <p>
                                Com infraestrutura moderna e equipamentos de ponta, oferecemos aos estudantes e à
                                comunidade um ambiente propício para materializar ideias, desenvolver protótipos e criar
                                soluções inovadoras.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center mt-24">
                                <div className="flex flex-col items-center">
                                    <span className="text-yellow-muted text-4xl font-semibold">500+</span>
                                    <span className="text-[#4A5565] text-lg mt-2">Usuarios Ativos</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-yellow-muted text-4xl font-semibold">150+</span>
                                    <span className="text-[#4A5565] text-lg mt-2">Projetos Concluidos</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-yellow-muted text-4xl font-semibold">50+</span>
                                    <span className="text-[#4A5565] text-lg mt-2">Equipamentos</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
