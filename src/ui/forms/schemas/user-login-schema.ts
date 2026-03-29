import * as z from "zod";

export const userLoginSchema = z.object({
    email: z.email("Por favor, insira um endereço de e-mail válido"),

    password: z.string().min(1, "Por favor, insira sua senha"),
    remember: z.boolean(),
});

export type UserLoginData = z.infer<typeof userLoginSchema>;
