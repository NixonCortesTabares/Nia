import {
  ActualizarHorarioAtencionDTO,
  HorarioAtencion,
} from '../../domain/entities/HorarioAtencion';
import { IHorarioAtencionRepository } from '../../domain/repositories/IHorarioAtencionRepository';
import { validarDiaSemana, validarHora } from './CrearHorarioAtencionUseCase';

export interface ActualizarHorarioAtencionUseCaseDTO {
  id: string;
  negocioId: string;
  data: ActualizarHorarioAtencionDTO;
}

export class ActualizarHorarioAtencionUseCase {
  constructor(private horarioRepository: IHorarioAtencionRepository) {}

  async execute(input: ActualizarHorarioAtencionUseCaseDTO): Promise<HorarioAtencion | null> {
    const horario = await this.horarioRepository.buscarPorId(input.id, input.negocioId);

    if (!horario) {
      return null;
    }

    if (input.data.diaSemana !== undefined) {
      validarDiaSemana(input.data.diaSemana);
    }

    if (input.data.horaApertura !== undefined) {
      validarHora(input.data.horaApertura, 'horaApertura');
    }

    if (input.data.horaCierre !== undefined) {
      validarHora(input.data.horaCierre, 'horaCierre');
    }

    return this.horarioRepository.actualizar(input.id, input.negocioId, input.data);
  }
}
