import { apiClient } from './apiClient';

export interface HorarioAtencion {
  id: string;
  negocioId: string;
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  activo: boolean;
}

export interface HorarioAtencionPayload {
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  activo?: boolean;
}

export async function obtenerHorariosAtencion() {
  const response = await apiClient.get<{
    ok: boolean;
    mensaje: string;
    horarios: HorarioAtencion[];
  }>('/horarios-atencion');

  return response.data;
}

export async function crearHorarioAtencion(data: HorarioAtencionPayload) {
  const response = await apiClient.post<{
    ok: boolean;
    mensaje: string;
    horario: HorarioAtencion;
  }>('/horarios-atencion', data);

  return response.data;
}

export async function actualizarHorarioAtencion(
  id: string,
  data: Partial<HorarioAtencionPayload>
) {
  const response = await apiClient.patch<{
    ok: boolean;
    mensaje: string;
    horario: HorarioAtencion;
  }>(`/horarios-atencion/${id}`, data);

  return response.data;
}
