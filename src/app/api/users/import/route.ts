import { importUsers, importUsersSchema } from "@/src/infra/modules/users/user-import.service";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        if (session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Apenas admins podem importar usuários" }, { status: 403 });
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ message: "Body inválido" }, { status: 400 });
        }

        const parsed = importUsersSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const result = await importUsers(parsed.data.usuarios);

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("[POST /api/users/import]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
