"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import { Clock4Icon,Box,Cpu,Bot,Zap,Layers,KanbanSquare,} from "lucide-react";

import CourseDialog from "@/ui/components/proprietary/landing_page/CourseDialog";

export default function CoursesAndTraining() {
  const [open, setOpen] = useState(false);
  const [cursoSelecionado, setCursoSelecionado] = useState("");

  function abrirDialog(curso: string) {
    setCursoSelecionado(curso);
    setOpen(true);
  }

  const courses = [
    {
      id: 1,
      title: "Modelagem e Impressão 3D",
      desc: "Aprenda a criar modelos 3D e utilize impressoras para materializar suas ideias",
      hours: "40 horas",
      icon: Box,
    },
    {
      id: 2,
      title: "Arduino e IoT",
      desc: "Desenvolva projetos de automação e Internet das Coisas com Arduino",
      hours: "60 horas",
      icon: Cpu,
    },
    {
      id: 3,
      title: "Robótica Educacional",
      desc: "Construa e programe robôs utilizando kits educacionais",
      hours: "50 horas",
      icon: Bot,
    },
    {
      id: 4,
      title: "Eletrônica Básica",
      desc: "Fundamentos de eletrônica e montagem de circuitos",
      hours: "45 horas",
      icon: Zap,
    },
    {
      id: 5,
      title: "Prototipagem Rápida",
      desc: "Técnicas para transformar ideias em protótipos funcionais",
      hours: "30 horas",
      icon: Layers,
    },
    {
      id: 6,
      title: "Gestão de Projetos Maker",
      desc: "Metodologias ágeis aplicadas ao desenvolvimento de projetos",
      hours: "20 horas",
      icon: KanbanSquare,
    },
  ];

  return (
    <section id="courses" className="bg-white py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <h2 className="text-4xl font-medium">
            Cursos e{" "}
            <span className="text-[#C49D00] font-bold">Capacitações</span>
          </h2>
          <p className="mt-4 text-gray-600">
            Desenvolva suas habilidades com nossos cursos práticos em tecnologias da indústria 4.0
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-20">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition"
            >
              <CardHeader>
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#FAD442]/50 mb-4">
                  <course.icon className="w-6 h-6 text-[#C49D00]" />
                </div>

                <CardTitle className="text-lg font-semibold">
                  {course.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-gray-600">{course.desc}</p>

                <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                  <Clock4Icon className="w-4 h-4" />
                  {course.hours}
                </div>
              </CardContent>

              <CardFooter>
                <button
                  onClick={() => abrirDialog(course.title)}
                  className="cursor-pointer w-full rounded-lg bg-[#F4C430] py-2 text-sm font-semibold text-black hover:bg-[#e0b52a] active:bg-[#cda627] transition duration-200 ease-in-out"
                >
                  INSCREVA-SE
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-20">
          <Button className="mt-11 w-60 h-10 2xl:w-80 2xl:h-12 rounded-xl border-2 border-black bg-white text-sm text-black hover:bg-black hover:text-white">
            Ver todos os Cursos
          </Button>
        </div>
      </div>

      <CourseDialog
        open={open}
        setOpen={setOpen}
        curso={cursoSelecionado}
      />
    </section>
  );
}
