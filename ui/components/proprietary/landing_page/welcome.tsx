import Link from "next/link";
import Image from "next/image";

export function Welcome() {
    return (
        <section className="flex justify-around items-center h-185 bg-black text-white pl-10">
            <div>
                <h2 className="text-6xl leading-tight">
                    Bem-vindo ao {" "}
                    <span className="block text-yellow-400">
                        ESPAÇO 4.0
                    </span>
                </h2>
                <p className="mt-9 w-140 text-gray-400 text-xl">
                    Sistema integrado de gestão do espaço maker do Instituto
                    Federal de Alagoas - Campus Arapiraca. Conectando
                    inovação, tecnologia e educação.
                </p>
                <Link href="#" className="text-[15px] text-black font-semibold mt-17 w-56 h-9 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 transition duration-200 ease-in-out rounded-[10px] flex items-center justify-center">
                    FAZER TOUR PELO ESPAÇO
                </Link>
            </div>
            <Image src="/espaco.png" width={730} height={487} alt="Imagem do Espaço Maker 4.0 do IFAL Arapiraca" className="w-184 h-120 rounded-2xl" />
        </section>
    )
}
