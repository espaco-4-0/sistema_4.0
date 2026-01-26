"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import RecoveryPasswordForm from "@/src/ui/modules/auth_pages/recovery-password-form";

// Componente que lê o token da URL
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // token válido APENAS para teste
  const TEST_TOKEN = "teste1234";
  const isValidToken = token === TEST_TOKEN;

  if (!isValidToken) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Token Inválido</h1>
          <p className="text-muted-foreground">
            O link de recuperação é inválido ou expirou.
          </p>
          <a
            href="/login-page"
            className="inline-block mt-4 text-sm text-blue-600 hover:underline"
          >
            Voltar para o login
          </a>
        </div>
      </div>
    );
  }

  return <RecoveryPasswordForm token={token} />;
}

// Página principal
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Carregando...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
