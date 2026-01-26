"use client";

import { Suspense } from "react";
import RecoveryPasswordForm from "@/src/ui/modules/auth_pages/recovery-password-form";

// renderiza o formulario
function ResetPasswordContent() {
  // token ficticio
  const mockToken = "dev-mock-token-123";
  return <RecoveryPasswordForm token={mockToken} />;
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
