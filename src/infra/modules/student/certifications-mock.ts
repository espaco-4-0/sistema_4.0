export interface CertificateCardProps {
    id: number;
    title: string;
    institution: string;
    completionDate: string;
    hours: number;
}

export const certificationsInformations = { achievedCertificates: 5, hoursStudied: 166, yearCertificates: 5 };

export const certifications: CertificateCardProps[] = [
    {
        id: 1,
        title: "React Avançado",
        institution: "IFAL",
        completionDate: "2025-11-18",
        hours: 40,
    },
    {
        id: 2,
        title: "TypeScript Essencial",
        institution: "IFAL",
        completionDate: "2025-09-05",
        hours: 32,
    },
    {
        id: 3,
        title: "Next.js Fundamentals",
        institution: "IFAL",
        completionDate: "2025-07-22",
        hours: 28,
    },
    {
        id: 4,
        title: "Testes com Jest",
        institution: "IFAL",
        completionDate: "2025-06-14",
        hours: 24,
    },
];
