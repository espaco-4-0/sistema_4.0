import { PrismaClient } from "@/src/generated/prisma/client";

export async function seedCertificates(prisma: PrismaClient, cursoId: string, emissorId: string, alunoId: string) {
    console.log("Semeando certificados...");

    const submissionId = "cert-sub-1";

    await prisma.certificateTemplate.upsert({
        where: { id: submissionId },
        update: {},
        create: {
            id: submissionId,
            title: "Certificado de Conclusão - Web Fullstack",
            description: "Certificamos que o aluno concluiu com êxito o curso.",
            workload: 120,
            fileUrl: "https://meubucket.com/templates/cert-base.pdf",
            status: "ACTIVE",
            course: cursoId,
            type: "DEFAULT",
            layout: {},
            emittedByUser: { connect: { id: emissorId } },
        },
    });

    const certificateId = "cert-emissao-1";

    await prisma.certificateSubscription.upsert({
        where: {
            templateId_alunoId: {
                templateId: submissionId,
                alunoId: alunoId,
            },
        },
        update: {},
        create: {
            id: certificateId,
            certificate: { connect: { id: submissionId } },
            aluno: { connect: { id: alunoId } },
        },
    });

    await prisma.certificateEmission.upsert({
        where: {
            templateId_alunoId: {
                templateId: submissionId,
                alunoId: alunoId,
            },
        },
        update: {
            totalDownloads: 0,
        },
        create: {
            id: "cert-perm-1",
            fileUrl: "https://meubucket.com/certificados-gerados/aluno-1-web.pdf",
            emittedBy: emissorId,
            course: cursoId,
            certificate: { connect: { id: submissionId } },
            aluno: { connect: { id: alunoId } },
        },
    });

    console.log("Certificados semeados com sucesso!");
}
