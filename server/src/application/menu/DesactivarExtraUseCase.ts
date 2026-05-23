import { Extra } from '../../domain/entities/Extra';
import { IExtraRepository } from '../../domain/repositories/IExtraRepository';

export interface DesactivarExtraUseCaseDTO {
  id: string;
  negocioId: string;
}

export class DesactivarExtraUseCase {
  constructor(private extraRepository: IExtraRepository) {}

  async execute(input: DesactivarExtraUseCaseDTO): Promise<Extra | null> {
    return this.extraRepository.desactivar(input.id, input.negocioId);
  }
}
