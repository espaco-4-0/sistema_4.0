"use client";

import { useState } from "react";
import { Button } from "@/src/ui/components/ui/button";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";
import LeftSpaceDecoration from "@/src/ui/modules/auth_pages/left-space-decoration";


export default function RecoveryPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [passwordChanged, setPasswordChanged] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    if (newPassword.length < 6) {
      setMessage("A senha deve ter no mínimo 6 caracteres");
      setMessageType("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("As senhas não coincidem");
      setMessageType("error");
      return;
    }

    setPasswordChanged(true);
  };

  return (
    <div className="lg:grid lg:grid-cols-2 min-h-screen">
      <LeftSpaceDecoration />

      <div className="relative flex items-center justify-center px-6">
        {/* Botão para voltar ao login */}
        {!passwordChanged && (
          <Link
            href="/login-page"
            className="absolute top-8 left-6 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para login
          </Link>
        )}

        <div className="w-full max-w-md space-y-8 mt-12 lg:mt-0">
          {passwordChanged ? (
            <div className="flex flex-col items-center text-center w-full">
              <div className="mb-6 w-16 h-16 flex items-center justify-center rounded-lg bg-yellow-primary border-2 border-black">
                <CheckCircle className="h-8 w-8 text-black" strokeWidth={2} />
              </div>

              <h2 className="mb-2 text-2xl font-bold">Senha alterada com sucesso!</h2>

              <p className="mb-8 text-sm text-gray-600">
                Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.
              </p>

              <Link href="/login-page" className="w-full max-w-md">
                <Button className="mb-6 w-full rounded-lg hover:cursor-pointer hover:bg-yellow-secondary bg-yellow-primary text-black h-12">
                  VOLTAR PARA LOGIN
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Cabeçalho - Ícone, título e descrição */}
              <div className="flex flex-col items-center gap-4 text-center">
                {/* Ícone de cadeado amarelo */}
                <div className="w-16 h-16 bg-yellow-primary rounded-lg flex items-center justify-center border-2 border-black">
                  <Lock className="h-8 w-8 text-black" />
                </div>

                <h1 className="text-2xl font-bold">Redefinir Senha</h1>
                <p className="text-muted-foreground text-sm">
                  Digite sua nova senha abaixo
                </p>
              </div>

              {/* Formulário principal */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campo: Nova Senha */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua nova senha"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                      required
                    />
                    {/* Botão para mostrar/esconder a senha */}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/*  confirma a nova senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10"
                      required
                    />
                    {/* mostra ou esconde a senha de confirmação */}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* mostra erro ou sucesso */}
                {message && (
                  <div className={`p-3 rounded text-sm ${
                    messageType === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}>
                    {message}
                  </div>
                )}

                {/* botão de submit */}
                <Button
                  type="submit"
                  className="w-full hover:cursor-pointer h-12 text-base font-semibold bg-black text-yellow-primary hover:bg-black/90"
                >
                  REDEFINIR SENHA
                </Button>
              </form>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium">Requisitos da senha:</p>
                <ul className="space-y-1">
                  <li>• Mínimo de 6 caracteres</li>
                  <li>• As senhas devem coincidem</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
