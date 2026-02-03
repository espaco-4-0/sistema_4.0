import { Button } from "@/src/ui/components/ui/button";
import Image from "next/image";

export function Welcome() {
    return (
        <section
            id="welcome"
            className="mt-20 lg:mt-18 2xl:mt-22 flex flex-col-reverse items-center justify-around gap-12 px-6 py-16 bg-black text-white lg:flex-row lg:px-10 lg:h-185"
        >
            <div className="flex flex-col min-w-0">
                <h2 className="text-4xl leading-tight sm:text-5xl lg:text-6xl">
                    Bem-vindo ao <span className="block text-yellow-primary">ESPAÇO 4.0</span>
                </h2>

                <p className="mt-6 w-full max-w-140 wrap-break-word text-base text-gray-400 sm:text-lg lg:mt-9 lg:text-xl ">
                    Sistema integrado de gestão do espaço maker do Instituto Federal de Alagoas - Campus Arapiraca.
                    Conectando inovação, tecnologia e educação.
                </p>

                <Button className="flex items-center justify-center mt-10 w-56 h-9 rounded-[10px] bg-yellow-secondary text-[15px] font-semibold text-black cursor-pointer  transition duration-200 ease-in-out hover:bg-yellow-seconday-dark active:bg-yellow-primary-dark sm:mt-12 lg:mt-17 hover:bg-yellow-secondary-dark">
                    FAZER TOUR PELO ESPAÇO
                </Button>
            </div>

            <Image
                src="/espaco-externo.png"
                width={730}
                height={487}
                alt="Imagem do Espaço Maker 4.0 do IFAL Arapiraca"
                className=" w-full max-w-md rounded-2xl sm:max-w-lg lg:max-w-full lg:w-184 lg:h-120"
            />
        </section>
    );
}
