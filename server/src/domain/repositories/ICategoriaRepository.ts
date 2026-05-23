import { ActualizarCategoriaDTO, Categoria, CrearCategoriaDTO } from '../entities/Categoria';

export interface ICategoriaRepository {
  crear(data: CrearCategoriaDTO): Promise<Categoria>;
  buscarPorNegocio(negocioId: string): Promise<Categoria[]>;
  buscarActivasPorNegocio(negocioId: string): Promise<Categoria[]>;
  buscarPorId(id: string, negocioId: string): Promise<Categoria | null>;
  buscarPorNombre(negocioId: string, nombre: string): Promise<Categoria | null>;
  actualizar(id: string, negocioId: string, data: ActualizarCategoriaDTO): Promise<Categoria | null>;
  desactivar(id: string, negocioId: string): Promise<Categoria | null>;
}
