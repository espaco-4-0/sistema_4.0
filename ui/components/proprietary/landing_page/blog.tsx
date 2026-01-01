"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";

const noticias = [
  {
    id: 1,
    titulo: "IoT e Automacao",
    descricao:
      "Máquina que reutiliza garrafa PET como filamento para impressão 3D ganha prêmio no CSBC",
    imagem: "/noticia-principal.png",
  },
  {
    id: 2,
    titulo: "Projeto de modelagem 3D",
    descricao:
      "Impressora 3D juntamente a IA faz com que o estudo do corpo humano seja revolucionado",
    imagem: "/noticia-secundaria.png",
  },
  {
    id: 3,
    titulo: "CSBC",
    descricao:
      "O Instituto Federal de Alagoas Campus Arapiraca chegou forte no CSBC",
    imagem: "/noticia-terciaria.png",
  },
  {
    id: 4,
    titulo: "Sustentabilidade",
    descricao:
      "Alunos do IFAL Campus Arapiraca envolvidos na área de sustentabilidade",
    imagem: "/noticia-quartenaria.png",
  },
  {
    id: 5,
    titulo: "Robótica",
    descricao: "Projetos de robótica ganham destaque no Espaço 4.0",
    imagem: "/noticia-quinta.png",
  },
];

export default function Blog() {
  const [lista, setLista] = useState(noticias);

  useEffect(() => {
    const interval = setInterval(() => {
      setLista((prev) => {
        const novaLista = [...prev];
        const primeiro = novaLista.shift();
        if (primeiro) novaLista.push(primeiro);
        return novaLista;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-white py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-center">
          <h2 className="font-medium text-4xl text-center">
            Novidades do{" "}
            <span className="text-[#C49D00] font-bold">Espaço 4.0!</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 pt-20">
          <div className="group relative lg:col-span-3 h-90 hover:cursor-pointer rounded-xl overflow-hidden shadow-lg">
            <Image
              src={lista[0].imagem}
              alt={lista[0].titulo}
              fill
              priority
              className="object-cover transition-transform duration-10000 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/80 flex items-end p-6">
              <div className="text-white transition-all duration-700">
                <p className="text-sm text-gray-300 mb-2 uppercase tracking-wide">
                  {lista[0].titulo}
                </p>
                <h3 className="text-2xl font-bold leading-tight">
                  {lista[0].descricao}
                </h3>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 grid hover:cursor-pointer grid-cols-2 gap-6">
            {lista.slice(1, 5).map((noticia) => (
              <div
                key={noticia.id}
                className="relative h-41.25 rounded-xl overflow-hidden shadow-md"
              >
                <Image
                  src={noticia.imagem}
                  alt={noticia.titulo}
                  fill
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-black/60 hover:bg-black/40 transition-all duration-300 flex items-end p-4">
                  <div className="text-white">
                    <h4 className="text-sm font-semibold leading-snug">
                      {noticia.titulo}
                    </h4>
                    <p className="text-xs text-gray-300 line-clamp-2">
                      {noticia.descricao}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-14">
          <Button variant="outline" className="border-2 cursor-pointer border-[#D1D5DC] px-8 py-3 rounded-md font-medium transition hover:bg-black hover:text-white">
            Mais Notícias
          </Button>
        </div>
      </div>
    </section>
  );
}
