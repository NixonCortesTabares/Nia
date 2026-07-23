import { apiClient } from "./apiClient";


export async function suscribirEvento() {
  const response = await apiClient.get<{
    ok: boolean;
    mensaje: string;
    evento:string;
  }>('/evento');

  return response.data;
}