export interface Profesional {
  id: string;
  negocioId: string;
  nombre: string;
  especialidad?: string;
  activo: boolean;
  creadoEn: Date;
}

export interface CrearProfesionalDTO {
  negocioId: string;
  nombre: string;
  especialidad?: string;
}

export interface ActualizarProfesionalDTO {
  nombre?: string;
  especialidad?: string;
}
