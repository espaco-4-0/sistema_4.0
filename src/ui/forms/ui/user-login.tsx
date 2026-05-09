"use client";

import { useState } from "react";
import { Button } from "@/src/ui/components/ui/button";
import { Checkbox } from "@/src/ui/components/ui/checkbox";
import { Label } from "@/src/ui/components/ui/label";
import { UserLoginData, userLoginSchema } from "@/src/ui/forms/schemas/user-login-schema";
import { InputText } from "@/src/ui/forms/ui/user-registration";
import { getDashboardHref } from "@/src/ui/lib/role-routing";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function UserLoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<UserLoginData>({
        resolver: zodResolver(userLoginSchema as any),
        defaultValues: {
            email: "",
            password: "",
            remember: false,
        },
        mode: "onTouched",
    });

    async function handleSubmit(data: UserLoginData) {
        setIsLoading(true);
        const id = toast.loading("Entrando...");

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
                remember: String(data.remember),
            });

            if (!res) {
                toast.error("Erro inesperado. Tente novamente.", { id, duration: 3000 });
                return;
            }

            if (res.error) {
                const message = res.error === "CredentialsSignin" ? "E-mail ou senha incorretos." : res.error;
                toast.error(message, { id, duration: 3000 });
                return;
            }

            toast.success("Login efetuado com sucesso!", { id, duration: 2000 });

            const session = await getSession();
            const role = (session?.user as { role?: string } | undefined)?.role;
            const destination = getDashboardHref(role) ?? "/";

            router.push(destination);
            router.refresh();
        } catch {
            toast.error("Erro de conexão. Verifique sua internet.", { id, duration: 3000 });
        } finally {
            setIsLoading(false);
        }
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

            <Button
                className="w-full hover:cursor-pointer h-12 text-base font-semibold bg-black text-yellow-primary hover:bg-black/90 mt-2"
                type="submit"
                disabled={isLoading}
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin w-4 h-4" />
                        Entrando...
                    </span>
                ) : (
                    "Entrar"
                )}
            </Button>
        </form>
    );
}
