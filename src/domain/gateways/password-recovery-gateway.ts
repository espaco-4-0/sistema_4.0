import { 
  PasswordRecoveryRequest, 
  PasswordResetRequest, 
  PasswordRecoveryResponse 
} from '../entities/password-recovery';

// recuperação e redefinição
export interface PasswordRecoveryGateway {
  requestPasswordRecovery(data: PasswordRecoveryRequest): Promise<PasswordRecoveryResponse>;
  
  resetPassword(data: PasswordResetRequest): Promise<PasswordRecoveryResponse>;
}
