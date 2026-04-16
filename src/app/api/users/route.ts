import { Prisma } from "@/src/generated/prisma/client";
import { createUserSchema } from "@/src/infra/modules/users/user.schema";
import { createUser, emailExists, listUsers } from "@/src/infra/modules/users/user.service";
import { requireAdmin } from "@/src/ui/lib/auth";
import { getErrorMessage, getRequestInfo } from "@/src/ui/lib/errors";
import { logger } from "@/src/ui/lib/logger";
import { parsePaginationParams, sanitizeSearch } from "@/src/ui/lib/pagination";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const unauthorized = await requireAdmin(request);
    if (unauthorized) return unauthorized;

    try {
        const { searchParams } = request.nextUrl;
        const { page, limit } = parsePaginationParams(searchParams);
        const search = sanitizeSearch(searchParams.get("search"));
        const role = searchParams.get("role");
        const active = searchParams.get("active");

        const result = await listUsers({ page, limit, search, role, active });

        return NextResponse.json(result);
    } catch (err: any) {
        logger.error(
            {
                message: err?.message,
                stack: err?.stack,
                route: getRequestInfo(request),
            },
            "Erro ao buscar usuários"
        );

        return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const unauthorized = await requireAdmin(request);
    if (unauthorized) return unauthorized;

    let body: any;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Body inválido" }, { status: 400 });
    }

    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
    }

    try {
        const alreadyExists = await emailExists(parsed.data.email);

        if (alreadyExists) {
            return NextResponse.json({ message: "Email já cadastrado" }, { status: 409 });
        }

        const user = await createUser(parsed.data);

        return NextResponse.json(
            {
                message: "Usuário criado com sucesso",
                data: user,
            },
            { status: 201 }
        );
    } catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            return NextResponse.json({ message: "Email já cadastrado" }, { status: 409 });
        }

        logger.error(
            {
                message: err?.message,
                stack: err?.stack,
                route: getRequestInfo(request),
            },
            "Erro ao criar usuário"
        );

        return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
    }
}
