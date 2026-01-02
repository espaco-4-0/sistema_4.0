import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "../../button";

export function UpcomingEvents() {
  const dados = [
    {
      id: 1,
      title: "Workshop de Impressão 3D",
      descriptions: "Aprenda os fundamentos e tecnologias da impressão 3D com aplicações práticas.",
      day: 15,
      mounth: "jun",
      time: 14,
    },
    {
      id: 2,
      title: "Introdução à Robótica Educacional",
      descriptions: "Explore conceitos básicos de robótica com atividades práticas e interativas.",
      day: 18,
      mounth: "jun",
      time: 15,
    },
    {
      id: 3,
      title: "Curso Básico de Programação",
      descriptions: "Aprenda lógica de programação e dê os primeiros passos no desenvolvimento de software.",
      day: 22,
      mounth: "jun",
      time: 14,
    },
    {
      id: 4,
      title: "Oficina de Tecnologia e Criatividade",
      descriptions: "Desenvolva projetos criativos utilizando tecnologia de forma prática e colaborativa.",
      day: 28,
      mounth: "jun",
      time: 16,
    }
  ];

  return (
    <section className="flex flex-col items-center mt-20 mb-20">
      <h2 className="text-4xl font-semibold text-center">
        Próximos <span className="text-[#FFD700]">Eventos</span>
      </h2>

      <p className="mt-5 mb-17 text-xl text-center text-gray-600">
        Participe de workshops, hackathons e eventos de inovação
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {dados.map((dado) => (
          <div key={dado.id}>
            <Card
              className="
                flex flex-col sm:flex-row
                w-full
                sm:w-150 sm:max-w-215
                lg:w-160
                2xl:w-215
                mx-auto
                gap-4 sm:gap-0
                items-start sm:items-center
                p-4 sm:p-8
                transition-all duration-200 ease-out
                will-change-transform
                hover:scale-[1.01]
                hover:shadow-xl
                hover:border-yellow-500
              "
            >
              <CardContent
                className="
                  flex items-center justify-center
                  w-65 h-20
                  sm:w-28 sm:h-38
                  shrink-0
                  gap-2 sm:gap-0
                  p-0
                  rounded-2xl
                  bg-[#FFD700]
                  sm:flex-col
                  sm:mr-6 sm:mb-0
                "
              >
                <p className="2xl:text-4xl leading-none sm:text-[42px]">
                  {dado.day}
                </p>
                <p className="mt-1 2xl:text-xl uppercase sm:mt-2">
                  {dado.mounth}
                </p>
              </CardContent>

              <div className="flex flex-col flex-1 w-full gap-2.5">
                <CardHeader
                  className="
                    flex flex-col
                    w-full
                    gap-2.5
                    p-0
                    sm:max-w-158
                  "
                >
                  <CardTitle className="text-xl 2xl:text-2xl">
                    {dado.title}
                  </CardTitle>

                  <CardDescription
                    className="
                      text-base
                      text-gray-600
                      lg:text-md
                      2xl:text-xl
                      2xl:leading-8
                    "
                  >
                    {dado.descriptions}
                  </CardDescription>
                </CardHeader>

                <CardFooter
                  className="
                    p-0
                    text-base
                    text-gray-600
                    2xl:text-xl
                  "
                >
                  {dado.time}h • Espaço 4.0
                </CardFooter>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <Button
        className="
          mt-11
          w-60 h-10
          sm:w-80 sm:h-12
          rounded-xl
          border-2 border-black
          bg-white
          text-sm text-black
          cursor-pointer
          sm:text-[20px]
          hover:bg-black
          hover:text-white
        "
      >
        VER TODOS OS EVENTOS
      </Button>
    </section>
  )
}
