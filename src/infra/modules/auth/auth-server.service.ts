import { invalidateCacheNamespace } from "@/lib/cache";
import { prisma } from "@/src/infra/data/prisma";
import { sendResetPasswordEmail } from "@/src/lib/email";
import { ConflictError, ValidationError } from "@/src/lib/errors/AppError";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { userRegistrationSchema } from "./auth.schema";

export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: string;
    remember: boolean;
}

const REGISTRATION_SALT_ROUNDS = 12;
const RESET_SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRATION_MS = 3600000; // 1 hour

export async function verifyUserCredentials(
    email: string,
    password: string,
    remember?: string
): Promise<AuthenticatedUser | null> {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || !user.isActive) {
        return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return null;
    }

    return {
        id: user.id,
        email: user.email,
        name: user.fullName,
        image: user.avatarUrl,
        role: user.role,
        remember: remember === "true",
    };
}

export async function registerUser(data: z.infer<typeof userRegistrationSchema>) {
    const haveUser = await prisma.user.findUnique({
        where: { email: data.email },
        select: { id: true },
    });

    if (haveUser) {
        throw new ConflictError("Email já cadastrado");
    }

    const hashedPassword = await bcrypt.hash(data.password, REGISTRATION_SALT_ROUNDS);

    const createdUser = await prisma.user.create({
        data: {
            fullName: data.completeName,
            email: data.email,
            password: hashedPassword,
            birthDate: new Date(data.dateOfBirth),
            phone: data.telephone,
            race: data.race,
            education: data.education,
            ifalAffiliation: data.ifalAffiliation,
            disability: data.deficiency ?? null,
            specialNeed: data.deficiencyNeeds ?? null,
        },
    });

    await invalidateCacheNamespace("users:list");

    return createdUser;
}

export async function requestPasswordRecovery(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (user) {
        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            throw new Error("JWT_SECRET não definido no .env");
        }

        const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: "1h" });

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: token,
                resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRATION_MS),
            },
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const resetLink = `${baseUrl}/reset-password?token=${token}`;

        await sendResetPasswordEmail(user.email, user.fullName ?? "Usuário", resetLink);
    }
}

export async function resetPasswordWithToken(token: string, novaSenha: string): Promise<void> {
    const user = await prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiresAt: { gt: new Date() },
        },
    });

    if (!user) {
        throw new ValidationError("Token inválido ou expirado. Solicite um novo link.");
    }

    const senhaHash = await bcrypt.hash(novaSenha, RESET_SALT_ROUNDS);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: senhaHash,
            resetToken: null,
            resetTokenExpiresAt: null,
        },
    });
}
