import { HorarioAtencion } from '../../domain/entities/HorarioAtencion';
import { IHorarioAtencionRepository } from '../../domain/repositories/IHorarioAtencionRepository';

export interface CrearHorarioAtencionUseCaseDTO {
  negocioId: string;
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  activo?: boolean;
}

export class CrearHorarioAtencionUseCase {
  constructor(private horarioRepository: IHorarioAtencionRepository) {}

  async execute(input: CrearHorarioAtencionUseCaseDTO): Promise<HorarioAtencion> {
    validarDiaSemana(input.diaSemana);
    validarHora(input.horaApertura, 'horaApertura');
    validarHora(input.horaCierre, 'horaCierre');

    const horario = await this.horarioRepository.crear({
      negocioId: input.negocioId,
      diaSemana: input.diaSemana,
      horaApertura: input.horaApertura,
      horaCierre: input.horaCierre,
      activo: input.activo,
    });

    if (!horario) {
      throw new Error('No se pudo crear el horario de atencion.');
    }

    return horario;
  }
}

export function validarDiaSemana(diaSemana: number): void {
  if (!Number.isInteger(diaSemana) || diaSemana < 0 || diaSemana > 6) {
    throw new Error('El dia de la semana debe ser un numero entero entre 0 y 6.');
  }
}

export function validarHora(value: string, campo: string): void {
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new Error(`El campo ${campo} debe tener formato HH:mm.`);
  }
}
