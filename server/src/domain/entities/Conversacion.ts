export type TipoConversacion = 'cita' | 'consulta' | 'cancelacion' | 'reagendamiento';
export type EstadoConversacion = 'activa' | 'resuelta' | 'escalada';

export interface Conversacion {
  id: string;
  negocioId: string;
  clienteId: string;
  tipo?: TipoConversacion;
  estado: EstadoConversacion;
  resumen?: string;
  iniciadaEn: Date;
  cerradaEn?: Date;
}

export interface CrearConversacionDTO {
  negocioId: string;
  clienteId: string;
  tipo?: TipoConversacion;
}

export interface ActualizarConversacionDTO {
  tipo?: TipoConversacion;
  estado?: EstadoConversacion;
  resumen?: string;
  cerradaEn?: Date;
}
