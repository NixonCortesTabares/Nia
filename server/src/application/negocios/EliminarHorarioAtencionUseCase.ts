import { IHorarioAtencionRepository } from '../../domain/repositories/IHorarioAtencionRepository';

export class EliminarHorarioAtencionUseCase {
  constructor(private horarioRepository: IHorarioAtencionRepository) {}

  async execute(id: string, negocioId: string): Promise<boolean> {
    return this.horarioRepository.eliminar(id, negocioId);
  }
}
