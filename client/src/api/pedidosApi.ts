import { apiClient } from './apiClient';

export interface PedidoProductoExtra {
  nombreExtra: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PedidoProducto {
  nombreProducto: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  notas: string | null;
  extras: PedidoProductoExtra[];
}

export interface Pedido {
  id: string;
  estado: string;
  tipoEntrega: string;
  direccionEntrega?: string | null;
  metodoPago?: string | null;
  total: number;
  costoDomicilio: string;
  creadoEn: string;
  notas: string;
  cliente?: {
    nombre: string | null;
    telefono: string | null;
  };
  productos: PedidoProducto[];
}

export async function obtenerPedidos(filtros?: {
  estado?: string;
  rango?: 'hoy' | '7d' | '30d' | 'mes';
  desde?: string;
  hasta?: string;
  limit?: number;
  offset?: number;
}) {
  const response = await apiClient.get<{
    ok: boolean;
    mensaje: string;
    pedidos: Pedido[];
  }>('/pedidos', {
    params: filtros,
  });

  return response.data;
}

export async function obtenerPedidoPorId(id: string) {
  const response = await apiClient.get(`/pedidos/${id}`);
  return response.data;
}

export async function actualizarEstadoPedido(id: string, estado: string) {
  const response = await apiClient.patch(`/pedidos/${id}/estado`, {
    estado,
  });

  return response.data;
}

export async function cancelarPedido(id: string) {
  const response = await apiClient.patch(`/pedidos/${id}/cancelar`);
  return response.data;
}