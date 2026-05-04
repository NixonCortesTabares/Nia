export interface VisitaServicio {
  id: string;
  visitaId: string;
  servicioId: string;
  profesionalId?: string;
  precioCobrado: number;
  duracionMinutos: number;
  creadoEn: Date;
}

export interface CrearVisitaServicioDTO {
  visitaId: string;
  servicioId: string;
  profesionalId?: string;
  precioCobrado: number;
  duracionMinutos: number;
}