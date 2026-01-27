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
        <div className="px-40 py-10">
            <h1 className="text-3xl font-semibold mb-4">Certificados</h1>
            <p className="text-gray-600">Visualize e baixe seus certificados</p>
            <div className="grid grid-cols-3 gap-6">
                <StatsCard label="Certificados conquistados" value={certificationsInformations.achievedCertificates} />
                <StatsCard label="Horas de aprendizado" value={certificationsInformations.achievedCertificates} />
                <StatsCard label="Concluidos este ano" value={certificationsInformations.achievedCertificates} />
            </div>
            <InputGroup className="my-5 px-2 h-10 border-0 bg-white shadow-[0_0_4px_rgba(0,0,0,0.15)]">
                <InputGroupInput
                    className="placeholder:text-gray-400"
                    placeholder="Buscar por título ou instituição..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <InputGroupAddon>
                    <SearchIcon className="text-gray-400" />
                </InputGroupAddon>
            </InputGroup>
            <div className="mt-8 grid grid-cols-3 gap-6 ">
                {filteredCertifications.map((certification) => (
                    <CertificateCard key={certification.id} {...certification} />
                ))}
            </div>
        </div>
    );
}
