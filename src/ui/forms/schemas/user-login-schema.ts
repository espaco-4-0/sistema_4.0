import * as z from "zod";

export const userLoginSchema = z.object({
    email: z.email("Por favor, insira um endereço de e-mail válido"),

    password: z.string(),
    remember: z.boolean().optional().default(false),
});

export type userLoginData = z.infer<typeof userLoginSchema>;
