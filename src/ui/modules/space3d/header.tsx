import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Header() {
    return (
        <header className="flex justify-between items-center px-6 h-20 mb-20 bg-slate-900/50 backdrop-blur-md border-b-[1.5px] border-slate-800">
            <div className="flex gap-3">
                <Image
                    src="/Icone-Espaco4.0.svg"
                    alt="Logo do Espaço 4.0"
                    width={48}
                    height={48}
                    className="shadow-2xl"
                    priority
                />
                <div className="flex flex-col">
                    <h1 className="text-white font-bold text-lg">Visualizador 3D</h1>
                    <p className="text-slate-200/60 text-xs">Conteiner Espaço 4.0</p>
                </div>
            </div>
            <Link
                href="/"
                aria-label="Voltar para o início"
                className="text-white font-medium bg-slate-800 px-3 md:px-4 py-2 rounded-lg shadow flex items-center justify-center"
            >
                <ArrowLeft className="size-5 md:hidden" />
                <span className="hidden md:inline">Voltar para o início</span>
            </Link>
        </header>
    );
}
