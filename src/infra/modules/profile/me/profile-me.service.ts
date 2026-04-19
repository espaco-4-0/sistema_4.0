import { invalidateCacheNamespace, rememberCache } from "@/lib/cache";
import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";

import { UpdateProfilePayload } from "./profile-me.schema";

const PROFILE_SELECT = {
    id: true,
    nomeCompleto: true,
    email: true,
    role: true,
    avatarUrl: true,
    telefone: true,
    dataNascimento: true,
    raca: true,
    educacao: true,
    ifalAfiliacao: true,
    deficiencia: true,
    necessidadeEspecial: true,
    createdAt: true,
} satisfies Prisma.UserSelect;

const UPDATED_PROFILE_SELECT = {
    id: true,
    nomeCompleto: true,
    email: true,
    role: true,
    avatarUrl: true,
    telefone: true,
    updatedAt: true,
} satisfies Prisma.UserSelect;

export type ProfileData = Prisma.UserGetPayload<{ select: typeof PROFILE_SELECT }>;
export type UpdatedProfileData = Prisma.UserGetPayload<{ select: typeof UPDATED_PROFILE_SELECT }>;

export async function getProfileById(userId: string): Promise<ProfileData | null> {
    return rememberCache(
        "profile:me",
        userId,
        async () =>
            prisma.user.findUnique({
                where: { id: userId },
                select: PROFILE_SELECT,
            }),
        120
    );
}

export async function emailExistsForAnotherProfile(userId: string, email: string): Promise<boolean> {
    const existing = await prisma.user.findFirst({
        where: {
            email,
            id: { not: userId },
        },
        select: { id: true },
    });

    return !!existing;
}

export async function updateProfileById(userId: string, payload: UpdateProfilePayload): Promise<UpdatedProfileData> {
    const updated = await prisma.user.update({
        where: { id: userId },
        data: {
            ...(payload.nomeCompleto !== undefined ? { nomeCompleto: payload.nomeCompleto } : {}),
            ...(payload.email !== undefined ? { email: payload.email } : {}),
            ...(payload.avatarUrl !== undefined ? { avatarUrl: payload.avatarUrl } : {}),
            ...(payload.telefone !== undefined ? { telefone: payload.telefone } : {}),
            ...(payload.dataNascimento !== undefined ? { dataNascimento: new Date(payload.dataNascimento) } : {}),
            ...(payload.raca !== undefined ? { raca: payload.raca } : {}),
            ...(payload.educacao !== undefined ? { educacao: payload.educacao } : {}),
            ...(payload.ifalAfiliacao !== undefined ? { ifalAfiliacao: payload.ifalAfiliacao } : {}),
            ...(payload.deficiencia !== undefined ? { deficiencia: payload.deficiencia } : {}),
            ...(payload.necessidadeEspecial !== undefined ? { necessidadeEspecial: payload.necessidadeEspecial } : {}),
        },
        select: UPDATED_PROFILE_SELECT,
    });

    await invalidateCacheNamespace("profile:me");
    await invalidateCacheNamespace("users:list");

    return updated;
}
