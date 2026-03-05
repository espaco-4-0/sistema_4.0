import Link from "next/link";

export default function Header() {
    return (
        <div className="flex justify-between items-center px-6 h-20 mb-20 bg-slate-900/50 backdrop-blur-md border-b-[1.5] border-slate-800">
            <div className="flex gap-3">
                <div className="size-12 bg-linear-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-2xl flex items-center justify-center font-bold">
                    4.0
                </div>
                <div className="flex flex-col">
                    <h1 className="text-white font-bold text-lg">Visualizador 3D</h1>
                    <p className="text-slate-200/60 text-xs">Conteiner Espaço 4.0</p>
                </div>
            </div>
            <Link href="/" className="text-white font-medium bg-slate-800 px-4 py-2 rounded-lg shadow">
                Voltar para o início
            </Link>
        </div>
    );
}
