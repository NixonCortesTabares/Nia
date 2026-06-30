export interface HorarioAtencion{
    id: string;
    negocioId: string;
    diaSemana: number;
    horaApertura: string;
    horaCierre: string;
    activo: boolean;
}

export interface CrearHorarioAtencionDTO {
  negocioId: string;
  diaSemana: number;
  horaApertura: string; // formato "HH:mm", ejemplo "07:00"
  horaCierre: string;   // formato "HH:mm", ejemplo "12:00"
  activo?: boolean;
}

export interface ActualizarHorarioAtencionDTO{
    diaSemana?: number;
    horaApertura?: string;
    horaCierre?: string;
    activo?: boolean;
}