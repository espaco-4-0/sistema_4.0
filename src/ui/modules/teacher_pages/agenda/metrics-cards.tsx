import { BadgeCheck, BookCheck, MailQuestion, ShieldCheck } from "lucide-react";

type Metrics = {
    aguardandoEmail: number;
    emAnalise: number;
    aguardandoIfal: number;
    aprovados: number;
};

type Props = {
    metrics: Metrics;
};

export function MetricsCards({ metrics }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-100 text-left">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Aguardando E-mail</p>
                    <MailQuestion className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.aguardandoEmail}</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 text-left">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Análise Administrativa</p>
                    <BookCheck className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.emAnalise}</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 text-left">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Aguardando IFAL</p>
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.aguardandoIfal}</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 text-left">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Aprovadas</p>
                    <BadgeCheck className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.aprovados}</p>
            </div>
        </div>
    );
}
