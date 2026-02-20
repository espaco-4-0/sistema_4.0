"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const noticias = [
    {
        id: 1,
        titulo: "IoT e Automacao",
        descricao: "Máquina que reutiliza garrafa PET como filamento para impressão 3D ganha prêmio no CSBC",
        imagem: "/noticia-principal.png",
    },
    {
        id: 2,
        titulo: "Projeto de modelagem 3D",
        descricao: "Impressora 3D juntamente a IA faz com que o estudo do corpo humano seja revolucionado",
        imagem: "/noticia-secundaria.jpg",
    },
    {
        id: 3,
        titulo: "CSBC",
        descricao: "O Instituto Federal de Alagoas Campus Arapiraca chegou forte no CSBC",
        imagem: "/noticia-terciaria.jpg",
    },
    {
        id: 4,
        titulo: "Sustentabilidade",
        descricao: "Alunos do IFAL Campus Arapiraca envolvidos na área de sustentabilidade",
        imagem: "/noticia-quartenaria.jpg",
    },
    {
        id: 5,
        titulo: "Robótica",
        descricao: "Projetos de robótica ganham destaque no Espaço 4.0",
        imagem: "/noticia-quinta.jpg",
    },
];

export default function Blog() {
    const router = useRouter();
    const [lista, setLista] = useState(noticias);

    useEffect(() => {
        const interval = setInterval(() => {
            setLista((prev) => {
                const novaLista = [...prev];
                const primeiro = novaLista.shift();

                if (primeiro) {
                    novaLista.push(primeiro);
                }

                return novaLista;
            });
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section id="blog" className="bg-white py-28">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="font-medium text-4xl text-center mb-17">
                    Novidades do <span className="text-yellow-muted font-bold">Espaço 4.0</span>
                </h2>

                <div className="grid grid-cols-6 grid-rows-2 gap-4">
                    <div className="bg-red-100 col-span-4 row-span-2 h-125 rounded-3xl mr-2 relative group overflow-hidden">
                        <div className="gap-5 absolute z-20 p-10 size-full flex flex-col justify-end items-start">
                            <span className="bg-yellow-primary py-1.5 px-5 rounded-2xl text-xs font-bold">
                                IOT E AUTOMAÇÃO
                            </span>
                            <h3 className="text-3xl font-bold text-white">{noticias[0].titulo}</h3>
                            <p className="text-white/80">{noticias[0].descricao}</p>
                            <Link className="flex font-bold gap-2 text-yellow-primary" href={"/"}>
                                Ler mais{" "}
                                <ArrowRight className="group-hover:translate-x-1 transition-transform duration-700" />
                            </Link>
                        </div>
                        <div className="absolute size-full z-10 inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent"></div>
                        <Image
                            src={noticias[0].imagem}
                            fill
                            alt={noticias[0].titulo}
                            className="rounded-3xl z-0 object-cover group-hover:scale-110 transition-all duration-700 brightness-70 group-hover:brightness-80"
                        />
                    </div>
                    {noticias.slice(1).map((noticia, index) => (
                        <motion.article
                            key={index}
                            initial={{ opacity: 0.6, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative bg-slate-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-60 cursor-pointer"
                        >
                            <div className="absolute size-full z-10 inset-0 bg-linear-to-t from-slate-900 via-slate-900/60 to-transparent" />
                            <Image
                                src={noticia.imagem}
                                alt={noticia.titulo}
                                fill
                                className=" z-0 object-cover group-hover:scale-110 transition-all duration-700 brightness-70 group-hover:brightness-80"
                            />
                            <div className="relative size-full flex flex-col gap-1 justify-end p-5 z-10">
                                <h3 className="text-md text-white font-bold">{noticia.titulo}</h3>
                                <p className="text-white/80 text-xs">{noticia.descricao}</p>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
