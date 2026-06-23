import { apiClient } from './apiClient';

export interface Extra {
  id: string;
  nombre: string;
  valor: number;
  activo: boolean;
}

export async function obtenerExtras() {
  const response = await apiClient.get<{
    ok: boolean;
    mensaje: string;
    extras: Extra[];
  }>('/extras');

  return response.data;
}

export async function crearExtra(data: {
  nombre: string;
  valor: number;
}) {
  const response = await apiClient.post('/extras', data);
  return response.data;
}

export async function actualizarExtra(
  id: string,
  data: Partial<{
    nombre: string;
    valor: number;
    activo: boolean;
  }>
) {
  const response = await apiClient.patch(`/extras/${id}`, data);
  return response.data;
} 

export async function obtenerInfoExtra(categoriaId: string){
    const response = await apiClient.get<{
        ok:boolean,
        mensaje: string,
        extra: Extra
    }>(`/extras/${categoriaId}`);

    return response.data;

}

export async function obtenerExtrasPorCategoria(categoriaId: string) {
  const response = await apiClient.get<{
    ok: boolean;
    mensaje: string;
    extras: Extra[];
  }>(`/extras/categorias/${categoriaId}`);

  return response.data;
}

export async function asignarExtraACategoria(
  categoriaId: string,
  extraId: string
) {
  const response = await apiClient.post(
    `/extras/categorias/${categoriaId}/${extraId}`
  );

  return response.data;
}

export async function quitarExtraDeCategoria(
  categoriaId: string,
  extraId: string
) {
  const response = await apiClient.delete(
    `/extras/categorias/${categoriaId}/${extraId}`
  );

  return response.data;
}