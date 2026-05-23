import { Cita, CrearCitaDTO, ActualizarCitaDTO } from '../entities/Cita';

export interface CitaClienteDTO {
  id: string;
  servicio_nombre: string;
  fecha: Date;
  hora: string;
  estado: Cita['estado'];
  notas: string | null;
}

export interface CitaActivaConDuracionDTO {
  id: string;
  fecha: Date;
  hora: string;
  duracion_minutos: number;
}

export interface ICitaRepository {
  crear(data: CrearCitaDTO): Promise<Cita>;
  buscarPorId(id: string): Promise<Cita | null>;
  buscarPorNegocio(negocioId: string): Promise<Cita[]>;
  buscarPorNegocioYPeriodo(negocioId: string, desde: Date, hasta: Date): Promise<Cita[]>;
  buscarPorCliente(clienteId: string, negocioId: string): Promise<CitaClienteDTO[]>;
  buscarActivasConDuracionPorFecha(
    negocioId: string,
    fecha: string | Date,
    ignorarCitaId?: string
  ): Promise<CitaActivaConDuracionDTO[]>;
  buscarHorasOcupadas(negocioId: string, fecha: Date): Promise<string[]>;
  actualizar(id: string, data: ActualizarCitaDTO): Promise<Cita | null>;
}
