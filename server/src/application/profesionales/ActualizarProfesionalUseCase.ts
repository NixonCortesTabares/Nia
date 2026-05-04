import {
  ActualizarProfesionalDTO,
  Profesional,
} from '../../domain/entities/Profesional';
import { IProfesionalRepository } from '../../domain/repositories/IProfesionalRepository';

export interface ActualizarProfesionalUseCaseDTO {
  id: string;
  negocioId: string;
  data: ActualizarProfesionalDTO;
}

export class ActualizarProfesionalUseCase {
  constructor(private profesionalRepository: IProfesionalRepository) {}

  async execute(input: ActualizarProfesionalUseCaseDTO): Promise<Profesional | null> {
    const profesional = await this.profesionalRepository.buscarPorId(input.id);

    if (!profesional) {
      return null;
    }

    if (profesional.negocioId !== input.negocioId) {
      throw new Error('No autorizado');
    }

    return this.profesionalRepository.actualizar(input.id, input.data);
  }
}
