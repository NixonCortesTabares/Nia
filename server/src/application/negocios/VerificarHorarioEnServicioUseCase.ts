import { getFechaActualColombia } from "../../agent/prompt";
import { IHorarioAtencionRepository } from "../../domain/repositories/IHorarioAtencionRepository";

function horaAMinutos(hora: string): number {
  const [hh, mm] = hora.split(":").map(Number);

  if (
    Number.isNaN(hh) ||
    Number.isNaN(mm) ||
    hh < 0 ||
    hh > 23 ||
    mm < 0 ||
    mm > 59
  ) {
    throw new Error(`Hora inválida: ${hora}`);
  }

  return hh * 60 + mm;
}

export class VerificarHorarioEnServicioUseCase {
  constructor(private horarioRepo: IHorarioAtencionRepository) {}

  async execute(negocioId: string): Promise<boolean> {
    const horarios = await this.horarioRepo.buscarPorNegocio(negocioId);

    // Si el negocio no tiene horarios configurados,
    // mantenemos comportamiento anterior: siempre abierto.
    if (horarios.length === 0) {
      return true;
    }

    const fecha = getFechaActualColombia();

    const estaEnServicio = horarios.some((horario) => {
      if (!horario.activo) return false;
      if (horario.diaSemana !== fecha.diaSemana) return false;

      const apertura = horaAMinutos(horario.horaApertura);
      const cierre = horaAMinutos(horario.horaCierre);

      // Caso normal: 07:00 - 12:00
      if (apertura < cierre) {
        return (
          fecha.minutosActuales >= apertura &&
          fecha.minutosActuales < cierre
        );
      }

      // Caso nocturno: 20:00 - 02:00
      return (
        fecha.minutosActuales >= apertura ||
        fecha.minutosActuales < cierre
      );
    });

    return estaEnServicio;
  }
}