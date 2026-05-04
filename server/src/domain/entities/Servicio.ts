export interface Servicio {
  id: string;
  negocioId: string;
  nombre: string;
  descripcion?: string;
  duracionMinutos: number;
  precioBase: number;
  activo: boolean;
  creadoEn: Date;
}

export interface CrearServicioDTO {
  negocioId: string;
  nombre: string;
  descripcion?: string;
  duracionMinutos: number;
  precioBase: number;
}

export interface EditarServicioDTO {
  nombre?: string;
  descripcion?: string;
  duracionMinutos?: number;
  precioBase?: number;
}