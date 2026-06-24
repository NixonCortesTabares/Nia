import { apiClient } from './apiClient';

export type EstadoConversacion = 'activa' | 'resuelta' | 'escalada';

export interface ConversacionResumen {
  id: string;
  estado: EstadoConversacion;
  cliente: {
    nombre: string | null;
    telefono: string | null;
  };
  ultimoMensaje: string | null;
  ultimaActividadEn: string | null;
  creadoEn: string;
}

export interface ConversacionDetalle {
  id: string;
  negocioId: string;
  clienteId: string;
  tipo?: string;
  estado: EstadoConversacion;
  resumen?: string;
  creadoEn: string;
  cerradoEn?: string;
  ultimaActividadEn: string;
}

export async function obtenerConversaciones() {
  const response = await apiClient.get<{
    ok: boolean;
    mensaje: string;
    conversaciones: ConversacionResumen[];
  }>('/conversaciones');

  return response.data;
}

export async function obtenerConversacionPorId(id: string) {
  const response = await apiClient.get<{
    ok: boolean;
    mensaje: string;
    conversacion: ConversacionDetalle;
  }>(`/conversaciones/${id}`);

  return response.data;
}

export async function tomarControlConversacion(id: string) {
  const response = await apiClient.patch<{
    ok: boolean;
    mensaje: string;
    conversacion: ConversacionDetalle;
  }>(`/conversaciones/${id}/tomar-control`);

  return response.data;
}
