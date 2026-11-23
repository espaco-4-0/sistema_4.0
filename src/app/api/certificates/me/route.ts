import { listEmissionsForStudent } from "@/src/infra/modules/certificates/certificates.service";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

/** Certificados emitidos para o usuário logado. */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        const emissoes = await listEmissionsForStudent(session.user.id);

        const data = emissoes.map((emissao) => ({
            id: emissao.id,
            title: emissao.certificate.title,
            type: emissao.certificate.type,
            hours: emissao.certificate.workload,
            course: emissao.course,
            emittedAt: emissao.emittedAt,
            validUntil: emissao.validUntil,
            totalDownloads: emissao.totalDownloads,
        }));

        const totalHoras = data.reduce((sum, item) => sum + (item.hours ?? 0), 0);
        const anoAtual = new Date().getFullYear();

        return NextResponse.json(
            {
                data,
                summary: {
                    achievedCertificates: data.length,
                    hoursStudied: totalHoras,
                    yearCertificates: data.filter((item) => new Date(item.emittedAt).getFullYear() === anoAtual).length,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[GET /api/certificates/me]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
