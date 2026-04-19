import { prisma } from "@/src/infra/data/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../../auth/[...nextauth]/route";

type Params = { params: { id: string } };

export async function POST(_req: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }
        const courseId = params.id?.trim();
        if (!courseId) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const course = await prisma.curso.findUnique({
            where: { id: courseId },
            select: { id: true, ativo: true },
        });

        if (!course) {
            return NextResponse.json({ message: "Curso não encontrado" }, { status: 404 });
        }

        if (!course.ativo) {
            return NextResponse.json({ message: "Curso inativo para inscrição" }, { status: 409 });
        }

        const alreadySubscribed = await prisma.inscricao.findUnique({
            where: {
                userId_cursoId: {
                    userId: session.user.id,
                    cursoId: courseId,
                },
            },
        });

        if (alreadySubscribed) {
            return NextResponse.json({ message: "Você já está inscrito neste curso" }, { status: 409 });
        }

        const subscription = await prisma.inscricao.create({
            data: {
                userId: session.user.id,
                cursoId: courseId,
            },
        });

        return NextResponse.json({ message: "Inscrição realizada com sucesso", subscription }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/courses/[id]/subscribe]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        const courseId = params.id?.trim();
        if (!courseId) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const subscription = await prisma.inscricao.findUnique({
            where: {
                userId_cursoId: {
                    userId: session.user.id,
                    cursoId: courseId,
                },
            },
        });

        if (!subscription) {
            return NextResponse.json({ message: "Você não está inscrito neste curso" }, { status: 404 });
        }

        await prisma.inscricao.delete({
            where: {
                userId_cursoId: {
                    userId: session.user.id,
                    cursoId: courseId,
                },
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[DELETE /api/courses/[id]/subscribe]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
