import { Education, Race } from "@/src/generated/prisma/enums";
import { prisma } from "@/src/ui/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

import { userRegistrationFrontSchema } from "./../../../../ui/forms/schemas/user-registration-schema";

function normalizeEnum<T extends Record<string, string>>(enumObj: T, value: unknown): T[keyof T] | null {
    if (!value || typeof value !== "string") return null;

    const normalized = value.trim().toUpperCase().replaceAll(/\s+/g, "_");

    const enumValues = Object.values(enumObj);

    if (enumValues.includes(normalized as T[keyof T])) {
        return normalized as T[keyof T];
    }

    return null;
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const verifiedBody = userRegistrationFrontSchema.safeParse(body);

    if (!verifiedBody.success) {
        return NextResponse.json({ error: verifiedBody.error }, { status: 400 });
    }

    const { data } = verifiedBody; // ✅ use validated data

    const haveUser = await prisma.user.findUnique({
        where: { email: data.email },
        select: { id: true },
    });

    if (haveUser) {
        return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
    }

    try {
        await prisma.user.create({
            data: {
                nomeCompleto: data.nomeCompleto,
                email: data.email,
                senha: data.password,

                dataNascimento: new Date(data.dateOfBirth),

                telefone: data.whatsapp ?? null,

                raca: normalizeEnum(Race, data.race),
                educacao: normalizeEnum(Education, data.education),
                deficiencia: data.deficiency ?? null,
                necessidadeEspecial: data.deficiency_Needs ?? null,
            },
        });
    } catch (err: any) {
        console.log(err);

        return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
    }

    return NextResponse.json({ message: "criou" }, { status: 201 });
}
