"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/ui/components/button";
import LeftSpaceDecoration from "@/ui/components/proprietary/auth_pages/left-space-decoration";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";

export default function RecoveryPassword() {
    const [sent, setSent] = useState(false);
    const email = "email@email.com";

    return (
        <div className="lg:grid lg:grid-cols-2">
            <LeftSpaceDecoration />

            <div className="flex flex-col items-center justify-center">
                <div className="mt-2 mb-8 w-full max-w-md lg:mt-0">
                    <Button className="flex gap-2 px-0 text-sm text-gray-600 hover:text-gray-500 bg-white cursor-pointer hover:bg-white text-left">
                        <ArrowLeft /> <span>Voltar para login</span>
                    </Button>
                </div>

                {sent ? (
                    <div className="flex flex-col items-center text-center w-10/12 max-w-md lg:w-full">
                        <div className="mb-6 w-16 h-16 flex items-center justify-center rounded-lg border-2 border-black bg-[#FDC700]">
                            <Mail className="h-8 w-8" strokeWidth={2} />
                        </div>

                        <h2 className="mb-2 text-[16px]">E-mail Enviado!</h2>

                        <p className="mb-2 text-sm text-gray-600">
                            Enviamos um link de redefinição de senha para <strong>{email}</strong>
                        </p>

                        <p className="mb-8 text-sm text-gray-600">
                            Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                        </p>

                        <Button className="mb-6 w-full max-w-md rounded-lg cursor-pointer text-[#FDC700]">
                            VOLTAR PARA LOGIN
                        </Button>

                        <p className="text-sm text-gray-600">
                            Não recebeu o e-mail? <span className="cursor-pointer underline hover:text-yellow-600/50">Tente novamente</span>
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-8 w-10/12 max-w-md lg:w-full">
                        <h2 className="text-[16px] text-gray-900">Esqueceu sua senha?</h2>

                        <p className="-mt-6 text-center text-sm text-gray-600">
                            Não se preocupe! Digite seu e-mail e enviaremos instruções para redefinir sua senha.
                        </p>

                        <div className="w-full text-sm">
                            <span>E-mail</span>
                            <Input placeholder="Digite seu e-mail" className="h-12 border-gray-400 lg:h-9" />
                        </div>

                        <Button onClick={() => setSent(true)} className="w-full h-10 lg:h-9 cursor-pointer text-yellow-400 -mt-2">
                            ENVIAR LINK DE REDEFINIÇÃO
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
