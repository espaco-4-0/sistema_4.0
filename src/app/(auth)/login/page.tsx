"use client";

import { useState } from "react";
import { Button } from "@/src/ui/components/ui/button";
import { Checkbox } from "@/src/ui/components/ui/checkbox";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import LeftSpaceDecoration from "@/src/ui/modules/auth_pages/left-space-decoration";
import { Eye, EyeOff, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="lg:grid lg:grid-cols-2 min-h-screen">
            <LeftSpaceDecoration />
            <div className="relative flex items-center justify-center px-6">
                <Link
                    href="/"
                    className="absolute top-8 left-6 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:cursor-pointer"
                >
                    <Home className="h-4 w-4" />
                    Página Inicial
                </Link>

                <div className="w-full max-w-md space-y-8 mt-12 lg:mt-0">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="relative w-16 h-16">
                            <Image
                                src="/Icone-Espaco4.0.svg"
                                alt="Logo do Espaço 4.0"
                                fill
                                priority
                                className="object-contain"
                            />
                        </div>

                        <p className="text-muted-foreground text-sm">
                            Seja Bem-Vindo ao Sistema do Espaço 4.0 <br />
                            do IFAL Campus Arapiraca
                        </p>
                    </div>

                    <form className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Usuário</Label>
                            <Input id="email" type="email" placeholder="Digite seu e-mail" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Digite a sua senha"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="remember" className="hover:cursor-pointer" />
                                <Label htmlFor="remember" className="hover:cursor-pointer hover:text-gray-600">
                                    Lembrar-me
                                </Label>
                            </div>

                            <Link
                                href="/recovery-password"
                                className="text-muted-foreground hover:text-foreground transition"
                            >
                                Esqueci minha senha ?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full hover:cursor-pointer h-12 text-base font-semibold bg-black text-yellow-primary hover:bg-black/90"
                        >
                            ENTRAR
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Não possui uma conta?{" "}
                        <Link href="/register" className="font-semibold text-foreground hover:underline">
                            CRIE UMA
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
