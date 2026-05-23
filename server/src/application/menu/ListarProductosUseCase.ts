import { Producto } from '../../domain/entities/Producto';
import { IProductoRepository } from '../../domain/repositories/IProductoRepository';

export class ListarProductosUseCase {
  constructor(private productoRepository: IProductoRepository) {}

  async execute(negocioId: string): Promise<Producto[]> {
    return this.productoRepository.buscarPorNegocio(negocioId);
  }
}
