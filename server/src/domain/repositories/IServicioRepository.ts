import { Servicio, CrearServicioDTO, EditarServicioDTO } from '../entities/Servicio';

export interface IServicioRepository {
  crear(data: CrearServicioDTO): Promise<Servicio>;
  buscarPorNegocio(negocioId: string): Promise<Servicio[]>;
  buscarPorId(id: string): Promise<Servicio | null>;
  actualizar(id: string, data: EditarServicioDTO): Promise<Servicio>;
  desactivar(id:string): Promise<Servicio | null>;
}