export interface Visita {
  id: string;
  negocioId: string;
  clienteId: string;
  citaId?: string;
  fecha: Date;
  hora: string;
  totalCobrado?: number;
  registradoPor?: string;
  creadoEn: Date;
}

export interface CrearVisitaDTO {
  negocioId: string;
  clienteId: string;
  citaId?: string;
  fecha?: Date;
  hora?: string;
  totalCobrado?: number;
  registradoPor?: string;
}

export interface EditarVisitaDTO {
  
}