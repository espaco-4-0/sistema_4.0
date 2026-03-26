"use client";

import UserLoginForm from "@/src/ui/forms/ui/user-login";
import LeftSpaceDecoration from "@/src/ui/modules/auth_pages/left-space-decoration";
import { Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
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

                    <UserLoginForm />

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
