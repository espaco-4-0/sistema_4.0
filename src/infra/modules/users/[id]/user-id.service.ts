import { invalidateCacheNamespace } from "@/lib/cache";
import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/ui/lib/prisma";
import bcrypt from "bcryptjs";

import { PatchUserPayload } from "./user-id.schema";

const SALT_ROUNDS = 12;

const USER_UPDATE_SELECT = {
    id: true,
    nomeCompleto: true,
    email: true,
    role: true,
    ativo: true,
    updatedAt: true,
} satisfies Prisma.UserSelect;

export type UpdatedUser = Prisma.UserGetPayload<{ select: typeof USER_UPDATE_SELECT }>;

export function isPrismaNotFoundError(err: unknown): boolean {
    return typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2025";
}

export async function emailExistsForAnotherUser(id: string, email: string): Promise<boolean> {
    const existingByEmail = await prisma.user.findFirst({
        where: {
            email,
            id: { not: id },
        },
        select: { id: true },
    });

    return !!existingByEmail;
}

export async function updateUserById(id: string, data: PatchUserPayload): Promise<UpdatedUser> {
    const hashedPassword = data.senha ? await bcrypt.hash(data.senha, SALT_ROUNDS) : undefined;

    const updated = await prisma.user.update({
        where: { id },
        data: {
            ...(data.nomeCompleto !== undefined ? { nomeCompleto: data.nomeCompleto } : {}),
            ...(data.email !== undefined ? { email: data.email } : {}),
            ...(hashedPassword !== undefined ? { senha: hashedPassword } : {}),
            ...(data.telefone !== undefined ? { telefone: data.telefone } : {}),
            ...(data.role !== undefined ? { role: data.role } : {}),
            ...(data.ativo !== undefined ? { ativo: data.ativo } : {}),
            ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
            ...(data.deficiencia !== undefined ? { deficiencia: data.deficiencia } : {}),
            ...(data.necessidadeEspecial !== undefined ? { necessidadeEspecial: data.necessidadeEspecial } : {}),
        },
        select: USER_UPDATE_SELECT,
    });

    await invalidateCacheNamespace("users:list");
    await invalidateCacheNamespace("profile:me");

    return updated;
}
