"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { userLoginData, userLoginSchema } from "../schemas/user-login-schema";
import { InputText } from "./user-registration";

export default function UserLoginForm() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<userLoginData>({
        resolver: zodResolver(userLoginSchema as any),
        defaultValues: {
            email: "",
            password: "",
            remember: false,
        },
        mode: "onBlur",
    });

    async function handleSubmit(data: userLoginData) {
        setServerError(null);
        const res = await signIn("credentials", {
            redirect: false,
            email: data.email,
            password: data.password,
        });

        if (!res) {
            setServerError("Erro inesperado, tente novamente.");
            return;
        }

        if (res.error) {
            setServerError(res.error);
            form.setError("password", { type: "manual", message: "" });
            return;
        }

        router.push("/dashboard");
    }

    return (
        <form id="login" onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-3">
            <InputText name="email" label="E-mail" placeholder="nome@exemplo.com" control={form.control} type="email" />

            <InputText
                name="password"
                label="Senha"
                placeholder="Insira sua senha"
                control={form.control}
                type="password"
            />

            <div className="flex items-center justify-between text-sm">
                <Controller
                    name="remember"
                    control={form.control}
                    render={({ field }) => (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                className="hover:cursor-pointer"
                                checked={!!field.value}
                                onCheckedChange={(v) => field.onChange(!!v)}
                            />
                            <Label htmlFor="remember" className="hover:cursor-pointer hover:text-gray-600">
                                Lembrar-me
                            </Label>
                        </div>
                    )}
                />

                <Link href="/recovery-password" className="text-muted-foreground hover:text-foreground transition">
                    Esqueci minha senha ?
                </Link>
            </div>

            {serverError && (
                <div role="alert" aria-live="assertive" className="text-sm text-red-600">
                    {serverError}
                </div>
            )}

            <Button
                className="w-full hover:cursor-pointer h-12 text-base font-semibold bg-black text-yellow-primary hover:bg-black/90 mt-2"
                type="submit"
                form="login"
            >
                Entrar
            </Button>
        </form>
    );
}
