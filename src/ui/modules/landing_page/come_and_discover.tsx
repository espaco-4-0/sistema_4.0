import { Button } from "@/src/ui/components/ui/button";
import Link from "next/link";

export default function ComeAndDiscover() {
    const whatsappLink =
        "https://wa.me/558597947611?text=Ol%C3%A1%2C%20professora%20Renata.%20Vim%20pelo%20site%20do%20espa%C3%A7o+4.0!!";

    return (
        <section className="flex flex-col items-center justify-center h-auto py-10 2xl:py-18 gap-13 bg-yellow-primary text-center sm:gap-15 2xl:gap-14 px-4">
            <h2 className="text-3xl font-normal sm:text-3xl">
                Venha conhecer o <span className="font-bold">Espaço 4.0</span>
            </h2>

            <p className="text-2xl font-normal 2xl:text-2xl mb-3">
                Agende uma visita e descubra como podemos ajudar você a transformar suas ideias em realidade
            </p>

            <div className="flex flex-col gap-7 sm:flex-row sm:gap-26">
                <Link
                    href="/calendar"
                    className="w-50 bg-black hover:bg-[#242424] duration-250 text-white flex items-center justify-center h-14 rounded-xl text-xl font-normal cursor-pointer 2xl:w-55 2xl:h-15 2xl:rounded-3xl 2xl:text-2xl"
                >
                    Agendar Visita
                </Link>

                <Button
                    asChild
                    variant="outline"
                    className="w-50 h-14 rounded-xl border-2 border-black text-xl font-normal cursor-pointer hover:bg-black hover:text-white sm:border-3 2xl:w-55 2xl:h-15 2xl:rounded-3xl 2xl:text-2xl duration-250"
                >
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        Entre em Contato
                    </a>
                </Button>
            </div>
        </section>
    );
}
