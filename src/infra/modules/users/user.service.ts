import { invalidateCacheNamespace, rememberCache } from "@/lib/cache";
import { Prisma } from "@/src/generated/prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "../../data/prisma";
import { CreateUserPayload, VALID_ROLES, ValidRole } from "./user.schema";

const SALT_ROUNDS = 12;

const USER_PUBLIC_SELECT = {
    id: true,
    fullName: true,
    email: true,
    role: true,
    isActive: true,
    createdAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof USER_PUBLIC_SELECT }>;

export interface ListUsersFilter {
    page: number;
    limit: number;
    role?: string | null;
    search?: string;
    active?: string | null;
}

export interface ListUsersResult {
    data: PublicUser[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export async function listUsers(filter: ListUsersFilter): Promise<ListUsersResult> {
    const { page, limit, role, search = "", active } = filter;

    const normalizedRole = VALID_ROLES.find((r) => r === role) as ValidRole | undefined;

    const where: Prisma.UserWhereInput = {
        ...(normalizedRole ? { role: normalizedRole } : {}),
        ...(active !== null && active !== undefined ? { isActive: active === "true" } : {}),
        ...(search
            ? {
                  OR: [
                      { fullName: { contains: search, mode: "insensitive" } },
                      { email: { contains: search, mode: "insensitive" } },
                  ],
              }
            : {}),
    };

    return rememberCache(
        "users:list",
        JSON.stringify({ page, limit, role: normalizedRole ?? null, search, active: active ?? null }),
        async () => {
            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    orderBy: { createdAt: "desc" },
                    skip: (page - 1) * limit,
                    take: limit,
                    select: USER_PUBLIC_SELECT,
                }),
                prisma.user.count({ where }),
            ]);

            return {
                data: users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.max(1, Math.ceil(total / limit)),
                },
            };
        },
        60
    );
}

export async function createUser(data: CreateUserPayload): Promise<PublicUser> {
    const hashedPassword = await bcrypt.hash(data.senha, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: {
            fullName: data.nomeCompleto,
            email: data.email,
            password: hashedPassword,
            birthDate: new Date(data.dataNascimento),
            phone: data.telefone,
            race: data.raca,
            education: data.educacao,
            ifalAffiliation: data.ifalAfiliacao,
            disability: data.deficiencia ?? null,
            specialNeed: data.necessidadeEspecial ?? null,
            role: data.role ?? "VISITOR",
            isActive: data.ativo ?? true,
        },
        select: USER_PUBLIC_SELECT,
    });

    await invalidateCacheNamespace("users:list");

    return user;
}

export async function emailExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });
    return !!user;
}
