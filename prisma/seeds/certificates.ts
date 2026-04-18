import { PrismaClient } from "@/src/generated/prisma/client";

export async function seedCertificates(prisma: PrismaClient, cursoId: string, emissorId: string, alunoId: string) {
    console.log("Semeando certificados...");

    const submissionId = "cert-sub-1";

    await prisma.certificateSubmission.upsert({
        where: { id: submissionId },
        update: {},
        create: {
            id: submissionId,
            titulo: "Certificado de Conclusão - Web Fullstack",
            descricao: "Certificamos que o aluno concluiu com êxito o curso.",
            cargaHoraria: 120,
            arquivoUrl: "https://meubucket.com/templates/cert-base.pdf",
            status: "ATIVO",
            curso: cursoId,
            emissor: { connect: { id: emissorId } },
        },
    });

    const certificateId = "cert-emissao-1";

    await prisma.certificate.upsert({
        where: {
            certificateId_alunoId: {
                certificateId: submissionId,
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

    await prisma.certificateEmissionPermission.upsert({
        where: {
            certificateId_alunoId: {
                certificateId: certificateId,
                alunoId: alunoId,
            },
        },
        update: {
            totalDownloads: 0,
        },
        create: {
            id: "cert-perm-1",
            arquivoUrl: "https://meubucket.com/certificados-gerados/aluno-1-web.pdf",
            emitidoPor: emissorId,
            certificate: { connect: { id: certificateId } },
            aluno: { connect: { id: alunoId } },
        },
    });

    console.log("Certificados semeados com sucesso!");
}
