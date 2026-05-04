import { Cita, CrearCitaDTO, ActualizarCitaDTO } from '../entities/Cita';

export interface ICitaRepository {
  crear(data: CrearCitaDTO): Promise<Cita>;
  buscarPorId(id: string): Promise<Cita | null>;
  buscarPorNegocio(negocioId: string): Promise<Cita[]>;
  buscarPorNegocioYPeriodo(negocioId: string, desde: Date, hasta: Date): Promise<Cita[]>;
  buscarHorasOcupadas(negocioId: string, fecha: Date): Promise<string[]>;
  actualizar(id: string, data: ActualizarCitaDTO): Promise<Cita | null>;
}
