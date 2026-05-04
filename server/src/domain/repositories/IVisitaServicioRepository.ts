// domain/repositories/IVisitaServicioRepository.ts

import { VisitaServicio, CrearVisitaServicioDTO } from '../entities/VisitaServicio';

export interface IVisitaServicioRepository {
  crear(data: CrearVisitaServicioDTO): Promise<VisitaServicio>;
  buscarPorVisita(visitaId: string): Promise<VisitaServicio[]>;
  buscarPorServicio(servicioId: string): Promise<VisitaServicio[]>;
  buscarPorNegocioYPeriodo(negocioId: string, desde: Date, hasta: Date): Promise<VisitaServicio[]>;
}
