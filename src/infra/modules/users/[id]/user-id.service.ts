import { invalidateCacheNamespace } from "@/lib/cache";
import { Prisma, User } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
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

export async function getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
        where: { id },
    });
}

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
    if (data.email) {
        const emailEmUso = await emailExistsForAnotherUser(id, data.email);
        if (emailEmUso) {
            throw new Error("Este e-mail já está em uso por outro usuário.");
        }
    }

    const hashedPassword = data.senha ? await bcrypt.hash(data.senha, SALT_ROUNDS) : undefined;

    const updated = await prisma.user.update({
        where: { id },
        data: {
            nomeCompleto: data.nomeCompleto,
            email: data.email,
            senha: hashedPassword,
            telefone: data.telefone,
            role: data.role,
            ativo: data.ativo,
            avatarUrl: data.avatarUrl,
            deficiencia: data.deficiencia,
            necessidadeEspecial: data.necessidadeEspecial,
        },
        select: USER_UPDATE_SELECT,
    });

    await invalidateCacheNamespace("users:list");
    await invalidateCacheNamespace("profile:me");

    return updated;
}
