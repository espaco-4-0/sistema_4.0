import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/ui/components/ui/card";
import Link from "next/link";

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
        },
    ];

    return (
        <section id="upcoming-events" className="flex flex-col items-center mt-20 mb-20">
            <h2 className="text-4xl font-semibold text-center">
                Próximos <span className="text-yellow-muted">Eventos</span>
            </h2>

            <p className="mt-5 mb-17 text-xl text-center text-gray-600">
                Participe de workshops, hackathons e eventos de inovação
            </p>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {dados.map((dado) => (
                    <div key={dado.id}>
                        <Link href={`/calendar?day=${dado.day}&month=${dado.mounth}`} className="block w-full h-full">
                            <Card className="flex flex-col sm:flex-row w-full sm:w-150 sm:max-w-215 lg:w-160 2xl:w-215 mx-auto gap-4 sm:gap-0 items-start sm:items-center p-4 sm:p-8 transition-all duration-200 ease-out will-change-transform hover:scale-[1.01] hover:shadow-xl hover:border-yellow-primary cursor-pointer">
                                <CardContent className="flex items-center justify-center w-65 h-2 sm:w-28 sm:h-38 shrink-0 gap-2 sm:gap-0 p-0 rounded-2xl bg-yellow-primary-light sm:flex-col sm:mr-6 sm:mb-0">
                                    <p className="2xl:text-4xl leading-none sm:text-[42px]">{dado.day}</p>
                                    <p className="mt-1 2xl:text-xl uppercase sm:mt-2">{dado.mounth}</p>
                                </CardContent>

                                <div className="flex flex-col flex-1 w-full gap-2.5">
                                    <CardHeader className="flex flex-col w-full gap-2.5 p-0 sm:max-w-158">
                                        <CardTitle className="text-xl 2xl:text-2xl">{dado.title}</CardTitle>

                                        <CardDescription className="text-base text-gray-600 lg:text-md 2xl:text-xl 2xl:leading-8">
                                            {dado.descriptions}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardFooter className="p-0 text-base text-gray-600 2xl:text-xl">
                                        {dado.time}h • Espaço 4.0
                                    </CardFooter>
                                </div>
                            </Card>
                        </Link>
                    </div>
                ))}
            </div>

            <Link
                href="/calendar"
                className="flex justify-center items-center mt-11 w-60 h-10 2xl:w-80 2xl:h-12 rounded-xl border-2 border-black bg-white text-bold text-black duration-250 cursor-pointer 2xl:text-[16px] hover:bg-black hover:text-white hover:cursor-pointer transition-all"
            >
                Ver todos os Eventos
            </Link>
        </section>
    );
}
