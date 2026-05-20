import { invalidateCacheNamespace, rememberCache } from "@/lib/cache";
import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";

import { UpdateProfilePayload } from "./profile-me.schema";

const PROFILE_SELECT = {
    id: true,
    fullName: true,
    email: true,
    role: true,
    avatarUrl: true,
    phone: true,
    birthDate: true,
    race: true,
    education: true,
    ifalAffiliation: true,
    disability: true,
    specialNeed: true,
    createdAt: true,
} satisfies Prisma.UserSelect;

const UPDATED_PROFILE_SELECT = {
    id: true,
    fullName: true,
    email: true,
    role: true,
    avatarUrl: true,
    phone: true,
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
            ...(payload.nomeCompleto !== undefined ? { fullName: payload.nomeCompleto } : {}),
            ...(payload.email !== undefined ? { email: payload.email } : {}),
            ...(payload.avatarUrl !== undefined ? { avatarUrl: payload.avatarUrl } : {}),
            ...(payload.telefone !== undefined ? { phone: payload.telefone } : {}),
            ...(payload.dataNascimento !== undefined ? { birthDate: new Date(payload.dataNascimento) } : {}),
            ...(payload.raca !== undefined ? { race: payload.raca } : {}),
            ...(payload.educacao !== undefined ? { education: payload.educacao } : {}),
            ...(payload.ifalAfiliacao !== undefined ? { ifalAffiliation: payload.ifalAfiliacao } : {}),
            ...(payload.deficiencia !== undefined ? { disability: payload.deficiencia } : {}),
            ...(payload.necessidadeEspecial !== undefined ? { specialNeed: payload.necessidadeEspecial } : {}),
        },
        select: UPDATED_PROFILE_SELECT,
    });

    await invalidateCacheNamespace("profile:me");
    await invalidateCacheNamespace("users:list");

    return updated;
}
