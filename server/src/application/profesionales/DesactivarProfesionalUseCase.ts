import { Profesional } from '../../domain/entities/Profesional';
import { IProfesionalRepository } from '../../domain/repositories/IProfesionalRepository';

export interface DesactivarProfesionalUseCaseDTO {
  id: string;
  negocioId: string;
}

export class DesactivarProfesionalUseCase {
  constructor(private profesionalRepository: IProfesionalRepository) {}

  async execute(input: DesactivarProfesionalUseCaseDTO): Promise<Profesional | null> {
    const profesional = await this.profesionalRepository.buscarPorId(input.id);

    if (!profesional) {
      return null;
    }

    if (profesional.negocioId !== input.negocioId) {
      throw new Error('No autorizado');
    }

    return this.profesionalRepository.desactivar(input.id);
  }
}
