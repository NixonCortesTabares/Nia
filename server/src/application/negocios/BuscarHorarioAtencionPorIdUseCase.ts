import { HorarioAtencion } from '../../domain/entities/HorarioAtencion';
import { IHorarioAtencionRepository } from '../../domain/repositories/IHorarioAtencionRepository';

export class BuscarHorarioAtencionPorIdUseCase {
  constructor(private horarioRepository: IHorarioAtencionRepository) {}

  async execute(id: string, negocioId: string): Promise<HorarioAtencion | null> {
    return this.horarioRepository.buscarPorId(id, negocioId);
  }
}
