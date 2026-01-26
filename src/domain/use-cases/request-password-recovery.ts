import { PasswordRecoveryGateway } from '../gateways/password-recovery-gateway';
import { PasswordRecoveryRequest } from '../entities/password-recovery';

export class RequestPasswordRecoveryUseCase {
  constructor(private readonly gateway: PasswordRecoveryGateway) {}

  async execute(data: PasswordRecoveryRequest) {
    return await this.gateway.requestPasswordRecovery(data);
  }
}
