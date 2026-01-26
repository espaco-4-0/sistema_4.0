import { PasswordRecoveryGateway } from '../gateways/password-recovery-gateway';
import { PasswordResetRequest } from '../entities/password-recovery';

export class ResetPasswordUseCase {
  constructor(private readonly gateway: PasswordRecoveryGateway) {}

  async execute(data: PasswordResetRequest) {
    return await this.gateway.resetPassword(data);
  }
}
