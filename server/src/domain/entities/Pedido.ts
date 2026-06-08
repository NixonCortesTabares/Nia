export type EstadoPedido = 'pendiente' | 'en_cocina' | 'en_ruta' | 'entregado' |'cancelado';
export type TipoEntrega = 'domicilio' | 'recoger_en_local'| 'consumo_en_local';
export type metodoPago = 'efectivo' | 'transferencia';

export interface Pedido{
    id: string,
    negocioId: string,
    clienteId: string,
    conversacionId: string,

    nombreCliente: string,
    telefonoCliente: string,
    tipoEntrega: TipoEntrega,
    direccionEntrega: string | null,
    metodoPago: metodoPago,

    costoDomicilio: number,
    total: number,
    estado: EstadoPedido,
    notas: string | null,
    creadoEn: Date
}

export interface CrearPedidoDTO{
    negocioId: string,
    clienteId: string,
    conversacionId: string,

    nombreCliente: string,
    telefonoCliente: string,
    tipoEntrega: TipoEntrega,
    direccionEntrega: string | null,
    metodoPago: metodoPago,

    costoDomicilio: number,
    total: number,
    notas: string | null

}

export interface ActualizarPedidoDTO{
    nombreCliente?: string,
    telefonoCliente?: string,
    tipoEntrega?: TipoEntrega,
    direccionEntrega?: string | null,
    metodoPago?: metodoPago,

    costoDomicilio?: number
    total?: number,
    estado?: EstadoPedido,
    notas?: string | null
}
