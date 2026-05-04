import { Visita, CrearVisitaDTO } from '../entities/Visita';

export interface IVisitaRepository {
  crear(data: CrearVisitaDTO): Promise<Visita>;
  buscarPorId(id: string): Promise<Visita | null>;
  buscarPorNegocio(negocioId: string): Promise<Visita[]>;
  buscarPorNegocioYPeriodo(negocioId: string, desde: Date, hasta: Date): Promise<Visita[]>;
  buscarPorCliente(clienteId: string): Promise<Visita[]>;
}
