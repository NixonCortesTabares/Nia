import { apiClient } from './apiClient';

export interface MensajeConversacion {
  id: string;
  conversacionId: string;
  origen: string;
  contenido: string;
  creadoEn: string;
  tipo?: string;
}

export async function obtenerMensajesConversacion(conversacionId: string) {
  const response = await apiClient.get<{
    ok: boolean;
    mensaje: string;
    mensajes: MensajeConversacion[];
  }>(`/mensajes/conversacion/${conversacionId}`);

  return response.data;
}

export async function enviarMensajeManual(
  conversacionId: string,
  contenido: string
) {
  const response = await apiClient.post<{
    ok: boolean;
    mensaje: string;
    resultado: MensajeConversacion;
  }>(`/mensajes/conversacion/${conversacionId}/manual`, {
    contenido,
  });

  return response.data;
}
