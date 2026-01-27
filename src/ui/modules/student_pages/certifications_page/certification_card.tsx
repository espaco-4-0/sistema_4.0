import { useState } from "react";
import { CertificateCardProps } from "@/src/infra/modules/student/certifications-mock";
import { Button } from "@/src/ui/components/ui/button";
import { Calendar, Clock, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function CertificateCard(certificated: Readonly<CertificateCardProps>) {
    const [isDownloading, setIsDownloading] = useState(false);
    const gradient = "from-yellow-primary to-yellow-secondary";
    const bg = "bg-yellow-back-icon";
    const text = "text-yellow-icon";
    const border = "border-slate-200";

    const handleDownload = async () => {
        setIsDownloading(true);

        // Pra parecer que ta baixando (delayzinho)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setIsDownloading(false);
        toast.success("Certificado baixado com sucesso!", {
            description: `O certificado de ${certificated.title} foi salvo em seus Downloads.`,
        });
    };

    const infoItems = [
        {
            id: 1,
            icon: <Calendar className={`w-4 h-4 ${text}`} />,
            label: "Conclusão",
            value: certificated.completionDate,
        },
        {
            id: 2,
            icon: <Clock className={`w-4 h-4 ${text}`} />,
            label: "Carga",
            value: `${certificated.hours}h`,
        },
    ];

    return (
        <div className="group relative">
            <div
                className={`absolute  -inset-1 bg-linear-to-r ${gradient} rounded-3xl opacity-0 group-hover:opacity-10 blur-2xl transition-all duration-500`}
            />

            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 p-7 hover:border-slate-300/50 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-black/5">
                <div
                    className={`absolute -top-12 -right-12 w-32 h-32 bg-linear-to-br ${gradient} opacity-[0.07] rounded-full blur-2xl`}
                />

                <div className="relative">
                    <div className="mb-6">
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <h3 className="text-black font-semibold text-xl leading-snug flex-1">
                                {certificated.title}
                            </h3>
                            <div className={`w-2 h-2 rounded-full ${bg} ${border} border-2 shrink-0 mt-1.5`} />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{certificated.institution}</p>
                    </div>

                    <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-100">
                        {infoItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-2.5">
                                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 mb-0.5">{item.label}</p>
                                    <p className="text-sm text-black font-semibold">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className={`
            w-full bg-linear-to-r ${gradient} hover:brightness-90
            hover:shadow-lg
            text-black py-3.5 rounded-xl
            transition-all duration-300 
            flex items-center justify-center gap-2.5
			h-12 cursor-pointer 
            disabled:opacity-70 disabled:cursor-not-allowed
			text-md font-normal
          `}
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Baixando...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                <span>Baixar Certificado</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
