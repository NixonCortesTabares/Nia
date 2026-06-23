import { apiClient } from './apiClient';

export interface Producto {
  id: string;
  categoriaId: string;
  categoriaNombre?: string;
  nombre: string;
  ingredientes?: string | null;
  descripcion?: string | null;
  valor: number;
  activo: boolean;
}

export async function obtenerProductos() {
  const response = await apiClient.get<{
    ok: boolean;
    mensaje: string;
    productos: Producto[];
  }>('/productos');

  return response.data;
}

export async function crearProducto(data: {
  categoriaId: string;
  nombre: string;
  ingredientes?: string;
  descripcion?: string;
  valor: number;
}) {
  const response = await apiClient.post('/productos', data);
  return response.data;
}

export async function actualizarProducto(
  id: string,
  data: Partial<{
    categoriaId: string;
    nombre: string;
    ingredientes: string;
    descripcion: string;
    valor: number;
    activo: boolean;
  }>
) {
  const response = await apiClient.patch(`/productos/${id}`, data);
  return response.data;
}

export async function obtenerProductoPorId(id: string) {
  const response = await apiClient.get<{
    ok: boolean;
    mensaje: string;
    resultado: Producto;
  }>(`/productos/${id}`);

  return response.data;
}