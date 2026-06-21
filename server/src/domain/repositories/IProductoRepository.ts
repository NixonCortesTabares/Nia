import { MenuProductoRow } from '../../infraestructure/repositories/ProductoRepository';
import { ActualizarProductoDTO, CrearProductoDTO, Producto } from '../entities/Producto';

export interface IProductoRepository {
  crear(data: CrearProductoDTO): Promise<Producto>;
  buscarPorNegocio(negocioId: string): Promise<Producto[]>;
  buscarActivosPorNegocio(negocioId: string): Promise<Producto[]>;
  buscarDisponiblesPorNegocio(negocioId: string): Promise<Producto[]>;
  buscarPorCategoria(negocioId: string, categoriaId: string): Promise<Producto[]>;
  buscarMenuActivoPorNegocio(negocioId: string):Promise<MenuProductoRow[]>
  buscarPorId(id: string, negocioId: string): Promise<Producto | null>;
  buscarPorNombre(negocioId: string, nombre: string): Promise<Producto | null>;
  actualizar(id: string, negocioId: string, data: ActualizarProductoDTO): Promise<Producto | null>;
  desactivar(id: string, negocioId: string): Promise<Producto | null>;
}
