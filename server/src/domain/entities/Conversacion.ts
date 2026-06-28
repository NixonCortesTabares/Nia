export type TipoConversacion = 'cita' | 'consulta' | 'cancelacion' | 'reagendamiento';
export type EstadoConversacion = 'activa' | 'resuelta' | 'escalada';

export interface PedidoBorradorItem {
  codigo_producto: number,
  nombre_producto: string;
  cantidad: number;
  extras: string[];
  notas: string | null;
}

export interface PedidoBorrador {
  nombre_cliente: string | null;
  telefono_cliente: string | null;
  tipo_entrega: 'domicilio' | 'recoger_en_local' | 'consumo_en_local';
  direccion_entrega: string | null;
  metodo_pago: 'efectivo' | 'transferencia' | null;
  items: PedidoBorradorItem[];
  notas: string | null;
}

export interface Conversacion {
  id: string;
  negocioId: string;
  clienteId: string;
  tipo?: TipoConversacion;
  estado: EstadoConversacion;
  resumen?: string;
  iniciadaEn: Date;
  cerradaEn?: Date;
  ultimoMensajeEn: Date;
  pedidoBorrador: PedidoBorrador;
}

export interface CrearConversacionDTO {
  negocioId: string;
  clienteId: string;
  tipo?: TipoConversacion;
}

export interface EditarConversacionDTO {
  tipo?: TipoConversacion;
  estado?: EstadoConversacion;
  resumen?: string;
  cerradaEn?: Date;
  ultimoMensajeEn?: Date;
}

export interface ActualizarConversacionDTO extends EditarConversacionDTO {}
