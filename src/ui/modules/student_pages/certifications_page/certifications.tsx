import { useState } from "react";
import { certifications, certificationsInformations } from "@/src/infra/modules/student/certifications-mock";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/src/ui/components/ui/input-group";
import { SearchIcon } from "lucide-react";

import { CertificateCard } from "./certification_card";
import { StatsCard } from "./stats_card";

export default function CertificationsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCertifications = certifications.filter((cert) => {
        const query = searchQuery.toLowerCase();
        return cert.title.toLowerCase().includes(query) || cert.institution.toLowerCase().includes(query);
    });

    return (
        <div className="px-4 pb-6 lg:px-8 lg:pb-8 2xl:px-15 2xl:pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 2xl:gap-6">
                <StatsCard label="Certificados conquistados" value={certificationsInformations.achievedCertificates} />
                <StatsCard label="Horas de aprendizado" value={certificationsInformations.hoursStudied} />
                <StatsCard label="Concluidos este ano" value={certificationsInformations.yearCertificates} />
            </div>
            <InputGroup className="my-4 lg:my-5 px-2 h-9 lg:h-10 border-0 bg-white shadow-[0_0_2px_rgba(0,0,0,0.15)]">
                <InputGroupInput
                    className="placeholder:text-gray-400 text-sm lg:text-base"
                    placeholder="Buscar por título ou instituição..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <InputGroupAddon>
                    <SearchIcon className="text-gray-400 size-4 lg:size-5" />
                </InputGroupAddon>
            </InputGroup>
            <div className="mt-5 lg:mt-6 2xl:mt-8 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-5 2xl:gap-6">
                {filteredCertifications.map((certification) => (
                    <CertificateCard key={certification.id} {...certification} />
                ))}
            </div>
        </div>
    );
}
