"use client";

import { useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/src/ui/components/ui/input-group";
import { Award, Loader2, SearchIcon } from "lucide-react";

import { CertificateCard } from "./certification_card";
import { useMyCertificates } from "./certifications.queries";
import { StatsCard } from "./stats_card";

export default function CertificationsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const { data, isLoading, isError } = useMyCertificates();

    const certifications = data?.data ?? [];
    const summary = data?.summary ?? { achievedCertificates: 0, hoursStudied: 0, yearCertificates: 0 };

    const filteredCertifications = certifications.filter((cert) => {
        const query = searchQuery.toLowerCase();
        return cert.title.toLowerCase().includes(query) || cert.course.toLowerCase().includes(query);
    });

    return (
        <div className="px-4 pb-6 lg:px-8 lg:pb-8 2xl:px-15 2xl:pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 2xl:gap-6">
                <StatsCard label="Certificados conquistados" value={summary.achievedCertificates} />
                <StatsCard label="Horas de aprendizado" value={summary.hoursStudied} />
                <StatsCard label="Concluidos este ano" value={summary.yearCertificates} />
            </div>

            <InputGroup className="my-4 lg:my-5 px-2 h-9 lg:h-10 border-0 bg-white shadow-[0_0_2px_rgba(0,0,0,0.15)]">
                <InputGroupInput
                    className="placeholder:text-gray-400 text-sm lg:text-base"
                    placeholder="Buscar por título ou curso..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <InputGroupAddon>
                    <SearchIcon className="text-gray-400 size-4 lg:size-5" />
                </InputGroupAddon>
            </InputGroup>

            {isLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" /> Carregando certificados...
                </div>
            ) : isError ? (
                <p className="text-center text-sm text-gray-500 py-16">Não foi possível carregar seus certificados.</p>
            ) : filteredCertifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Award className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">
                        {certifications.length === 0 ? "Você ainda não tem certificados" : "Nenhum resultado"}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        {certifications.length === 0
                            ? "Eles aparecem aqui assim que forem emitidos."
                            : "Ajuste a busca."}
                    </p>
                </div>
            ) : (
                <div className="mt-5 lg:mt-6 2xl:mt-8 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-5 2xl:gap-6">
                    {filteredCertifications.map((certification) => (
                        <CertificateCard
                            key={certification.id}
                            id={certification.id}
                            title={certification.title}
                            institution={certification.course}
                            completionDate={certification.emittedAt}
                            hours={certification.hours ?? 0}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
