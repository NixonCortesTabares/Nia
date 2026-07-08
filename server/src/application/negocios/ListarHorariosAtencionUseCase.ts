import { HorarioAtencion } from '../../domain/entities/HorarioAtencion';
import { IHorarioAtencionRepository } from '../../domain/repositories/IHorarioAtencionRepository';

export class ListarHorariosAtencionUseCase {
  constructor(private horarioRepository: IHorarioAtencionRepository) {}

  async execute(negocioId: string): Promise<HorarioAtencion[]> {
    return this.horarioRepository.buscarPorNegocio(negocioId);
  }
}
