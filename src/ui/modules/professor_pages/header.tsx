import { viewTitles } from "@/src/infra/modules/professor/header-mock";


interface HeaderProps {
    currentView: string;
}

export function Header({ currentView }: HeaderProps) {
    const { title, subtitle } = viewTitles[currentView] || viewTitles["visao-geral"];

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                </div>

                <div className="flex items-center gap-3">


                    <div className="flex items-center gap-2 ml-2">
                        <img
                            src="/renata.jpeg"
                            alt="Renata Imaculada"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium">Renata Imaculada</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
