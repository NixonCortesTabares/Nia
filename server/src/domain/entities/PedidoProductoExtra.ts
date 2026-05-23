export interface PedidoProductoExtra{
    id: string,
    pedidoProductoId: string,
    extraId: string | null,
    negocioId: string,

    nombreExtra: string,
    cantidad: number,
    precioUnitario: number,
    subtotal: number,
    creadoEn: Date
}

export interface CrearPedidoProductoExtraDTO {
  pedidoProductoId: string;
  extraId: string | null;
  negocioId: string;

  nombreExtra: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

