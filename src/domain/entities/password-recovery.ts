
export interface PasswordRecoveryRequest {
  email: string;
}

export interface PasswordResetRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// resposta do servidor
export interface PasswordRecoveryResponse {
  message: string;
  success: boolean;
}
