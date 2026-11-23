import { userRegistrationSchema } from "@/src/ui/forms/schemas/user-registration-schema";
import { z } from "zod";

export { userRegistrationSchema };
export const registerUserSchema = userRegistrationSchema;

export const recoveryPasswordSchema = z.object({
    email: z.string({ message: "E-mail é obrigatório" }).trim().min(1, "E-mail é obrigatório"),
});

export const resetPasswordSchema = z.object({
    token: z.string({ message: "Token e nova senha são obrigatórios" }).min(1, "Token e nova senha são obrigatórios"),
    novaSenha: z
        .string({ message: "Token e nova senha são obrigatórios" })
        .min(1, "Token e nova senha são obrigatórios"),
});

export type RegisterUserInput = z.infer<typeof userRegistrationSchema>;
export type RecoveryPasswordInput = z.infer<typeof recoveryPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
