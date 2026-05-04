"use client";

import { useRef, useState } from "react";
import { Button } from "@/src/ui/components/ui/button";
import { Input } from "@/src/ui/components/ui/input";
import { MailboxIcon } from "@/src/ui/components/ui/mailbox";
import { SendIcon, SendIconHandle } from "@/src/ui/components/ui/send";
import LeftSpaceDecoration from "@/src/ui/modules/auth_pages/left-space-decoration";
import { Home } from "lucide-react";
import Link from "next/link";

export default function RecoveryPassword() {
    const [sent, setSent] = useState(false);
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const sendIconRef = useRef<SendIconHandle>(null);

    const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const handleSend = async () => {
        if (!isValidEmail(email)) return;

        setErrorMessage("");

        try {
            setIsLoading(true);

            const res = await fetch("/api/auth/recovery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMessage(data.message || "Erro ao enviar o e-mail. Tente novamente.");
                return;
            }

            setSent(true);
            setTimeout(() => {
                sendIconRef.current?.startAnimation();
            }, 100);
        } catch {
            setErrorMessage("Erro de conexão. Verifique sua internet e tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="lg:grid lg:grid-cols-2 min-h-screen">
            <LeftSpaceDecoration />

            <div className="relative flex flex-col items-center justify-center px-6">
                <div className="absolute top-4 left-4">
                    <Button className="flex gap-2 px-0 text-sm text-gray-600 bg-white cursor-pointer hover:bg-white hover:text-black text-left transition-all">
                        <Link href="/login" className="flex gap-2 text-center items-center">
                            <Home />
                            Voltar para o login
                        </Link>
                    </Button>
                </div>

                {sent ? (
                    <div className="flex flex-col items-center text-center w-10/12 max-w-md lg:w-full">
                        <div className="mb-6 w-16 h-16 flex items-center justify-center rounded-lg border border-black bg-yellow-primary">
                            <SendIcon ref={sendIconRef} className="h-8 w-8" />
                        </div>

                        <h2 className="mb-2 text-[16px]">E-mail enviado!</h2>

                        <p className="mb-2 text-sm text-gray-600">
                            Enviamos um link de redefinição de senha para <strong>{email}</strong>
                        </p>

                        <p className="mb-8 text-sm text-gray-600">
                            Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                        </p>

                        <Link href="/login" className="w-full max-w-md">
                            <Button className="mb-6 w-full h-12 rounded-lg bg-gray-900 hover:cursor-pointer hover:bg-gray-950 transition-all text-yellow-primary">
                                Voltar para o login
                            </Button>
                        </Link>

                        <p className="text-sm text-gray-600">
                            Não recebeu o e-mail?{" "}
                            <Button
                                onClick={() => {
                                    setSent(false);
                                    setEmail("");
                                    setErrorMessage("");
                                }}
                                className="cursor-pointer underline text-gray-600 bg-white hover:bg-white p-0 hover:text-yellow-primary"
                            >
                                Tente novamente
                            </Button>
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-8 max-w-md lg:w-full">
                        <div className="flex rounded-xl h-15 w-15 items-center bg-yellow-400 justify-center border border-black">
                            <MailboxIcon className="h-10 w-10 flex items-center justify-center" />
                        </div>
                        <h2 className="text-[16px] text-gray-900">Esqueceu sua senha ?</h2>

                        <p className="-mt-6 text-center text-sm text-gray-600">
                            Não se preocupe! Digite seu e-mail e enviaremos instruções para redefinir sua senha.
                        </p>

                        <div className="w-full text-sm">
                            <span className="mb-5">E-mail</span>
                            <Input
                                type="email"
                                placeholder="Digite seu e-mail"
                                className="h-12 lg:h-9"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setErrorMessage("");
                                }}
                            />
                        </div>

                        {errorMessage && (
                            <div className="w-full p-3 rounded text-sm bg-red-50 text-red-800 border border-red-200 -mt-4">
                                {errorMessage}
                            </div>
                        )}

                        <Button
                            onClick={handleSend}
                            disabled={!isValidEmail(email) || isLoading}
                            className="w-full h-12 bg-gray-900 text-yellow-primary mt-2 hover:cursor-pointer hover:bg-gray-950 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-yellow-300 transition-all"
                        >
                            {isLoading ? "Enviando..." : "Link para redefinição"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
