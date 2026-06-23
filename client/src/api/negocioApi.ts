import { apiClient } from './apiClient';

export interface NegocioResponse {
  id: string;
  nombre: string;
  tipo: string;
  telefonoWs: string | null;
  ciudad: string | null;
  direccion: string | null;
  activo: boolean;
  creadoEn: string;
  menu_link: string | null;
  costo_domicilio: number | null;
}

export interface NegocioFormData {
  nombre: string;
  ciudad: string;
  direccion: string;
  menuLink: string;
  costoDomicilio: string;
}

export async function obtenerMiNegocio() {
  const response = await apiClient.get<{
    ok: boolean;
    mensaje: string;
    negocio: NegocioResponse;
  }>('/negocios/me');

  return response.data;
}

export async function actualizarMiNegocio(data: {
  nombre: string;
  ciudad: string;
  direccion: string;
  menu_link: string | null;
  costo_domicilio: number | null;
}) {
  const response = await apiClient.patch<{
    ok: boolean;
    mensaje: string;
    negocio: NegocioResponse;
  }>('/negocios/me', data);

  return response.data;
}