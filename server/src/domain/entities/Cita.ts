export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export interface Cita {
  id: string;
  negocioId: string;
  clienteId: string;
  conversacionId?: string;
  servicioId: string;
  profesionalId?: string;
  fecha: Date;
  hora: string;
  estado: EstadoCita;
  notas?: string;
  creadoEn: Date;
}

export interface CrearCitaDTO {
  negocioId: string;
  clienteId: string;
  servicioId: string;
  profesionalId?: string;
  conversacionId?: string;
  fecha: Date;
  hora: string;
  notas?: string;
}

export interface ActualizarCitaDTO {
  servicioId?: string;
  profesionalId?: string;
  conversacionId?: string;
  fecha?: Date;
  hora?: string;
  estado?: EstadoCita;
  notas?: string;
}
