import { ActualizarExtraDTO, CrearExtraDTO, Extra } from '../entities/Extra';

export interface IExtraRepository {
  crear(data: CrearExtraDTO): Promise<Extra>;
  buscarPorNegocio(negocioId: string): Promise<Extra[]>;
  buscarActivosPorNegocio(negocioId: string): Promise<Extra[]>;
  buscarPorId(id: string, negocioId: string): Promise<Extra | null>;
  buscarPorNombre(negocioId: string, nombre: string): Promise<Extra | null>;
  actualizar(id: string, negocioId: string, data: ActualizarExtraDTO): Promise<Extra | null>;
  desactivar(id: string, negocioId: string): Promise<Extra | null>;
  buscarPorCategoriaId(categoriaId: string, negocioId: string): Promise<Extra[] | null>
}
