import { apiClient } from './apiClient';

export type MensajeTipo = 'texto' | 'imagen' | 'documento';

export interface MensajeConversacion {
  id: string;
  negocioId?: string;
  conversacionId: string;
  origen: string;
  contenido: string;
  creadoEn: string;
  tipo?: MensajeTipo;
  mediaId?: string | null;
  mediaUrl?: string | null;
  mimeType?: string | null;
  caption?: string | null;
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
