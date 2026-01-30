import { useState } from "react";
import { CertificateCardProps } from "@/src/infra/modules/student/certifications-mock";
import { Button } from "@/src/ui/components/ui/button";
import { Calendar, Clock, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function CertificateCard(certificated: Readonly<CertificateCardProps>) {
    const [isDownloading, setIsDownloading] = useState(false);

    const style = {
        gradient: "from-yellow-primary to-yellow-secondary",
        bg: "bg-yellow-back-icon",
        text: "text-yellow-icon",
        border: "border-slate-200",
    };

    const handleDownload = async () => {
        setIsDownloading(true);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        const url = URL.createObjectURL(new Blob([], { type: "application/pdf" }));
        Object.assign(document.createElement("a"), {
            href: url,
            download: `certificado-${certificated.title.replaceAll(/\s+/g, "-").toLowerCase()}.pdf`,
        }).click();
        URL.revokeObjectURL(url);

        setIsDownloading(false);
        toast.success("Certificado baixado com sucesso!", {
            description: `O certificado de ${certificated.title} foi salvo em seus Downloads.`,
        });
    };

    const infoItems = [
        {
            id: 1,
            icon: Calendar,
            label: "Conclusão",
            value: certificated.completionDate,
        },
        {
            id: 2,
            icon: Clock,
            label: "Carga",
            value: `${certificated.hours}h`,
        },
    ];

    return (
        <div className="relative bg-white/90 rounded-2xl lg:rounded-3xl border border-slate-200/50 p-5 lg:p-6 2xl:p-7 hover:border-slate-300/50 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-yellow-primary-dark/10">
            <div
                className={`absolute -top-8 -right-8 w-32 h-32 lg:-top-10 lg:-right-10 lg:w-40 lg:h-40 2xl:-top-12 2xl:-right-12 2xl:w-48 2xl:h-48 bg-linear-to-br ${style.gradient} opacity-[0.08] rounded-full blur-2xl`}
            />

            <div className="relative">
                <div
                    className={`absolute top-1 right-1 w-2 h-2 rounded-full ${style.bg} border-yellow-primary/25 border-2`}
                />

                <h3 className="mb-1 lg:mb-1.5 text-black font-semibold text-lg lg:text-xl">{certificated.title}</h3>
                <p className="mb-4 lg:mb-5 2xl:mb-6 text-xs lg:text-sm text-gray-600 font-medium">
                    {certificated.institution}
                </p>

                <div className="flex items-center gap-4 lg:gap-5 2xl:gap-6 mb-4 lg:mb-5 2xl:mb-6 pb-4 lg:pb-5 2xl:pb-6 border-b border-slate-100">
                    {infoItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 lg:gap-2.5">
                            <item.icon className={`${style.text} rounded-lg p-2 lg:p-2.5 ${style.bg}`} size={32} />
                            <div>
                                <p className="text-xs text-gray-600 mb-0.5">{item.label}</p>
                                <p className="text-xs lg:text-sm font-semibold">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className={`
          					  w-full bg-linear-to-r ${style.gradient} hover:brightness-90 text-black py-3 lg:py-3.5 rounded-lg lg:rounded-xl
          					  hover:shadow-lg transition-all duration-250 h-10 lg:h-11 2xl:h-12 cursor-pointer text-sm lg:text-md font-normal
          					  disabled:opacity-70 disabled:cursor-not-allowed
          					`}
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            <span>Baixando...</span>
                        </>
                    ) : (
                        <>
                            <Download className="size-4" />
                            <span>Baixar Certificado</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
