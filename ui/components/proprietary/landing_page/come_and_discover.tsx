import { Button } from "@/components/ui/button";

export default function ComeAndDiscover() {
    return (
        <section className="flex flex-col items-center justify-center h-130 gap-13 bg-[#FFD700] text-center sm:gap-15 2xl:gap-19">
            <h2 className="text-3xl font-normal sm:text-4xl">
                Venha conhecer o <span className="font-bold">Espaço 4.0</span>
            </h2>

            <p className="text-2xl font-normal 2xl:text-3xl">
                Agende uma visita e descubra como podemos ajudar você a transformar suas ideias em realidade
            </p>

            <div className="flex flex-col gap-7 sm:flex-row sm:gap-29">
                <Button className="w-50 h-14 rounded-xl text-xl font-normal cursor-pointer 2xl:w-60 2xl:h-16 2xl:rounded-3xl 2xl:text-2xl">
                    Agendar Visita
                </Button>

                <Button
                    variant="outline"
                    className="w-50 h-14 rounded-xl border-2 border-black text-xl font-normal cursor-pointer hover:bg-black hover:text-white sm:border-3 2xl:w-60 2xl:h-16 2xl:rounded-3xl 2xl:text-2xl">
                    Entre em Contato
                </Button>
            </div>
        </section>
    );
}
