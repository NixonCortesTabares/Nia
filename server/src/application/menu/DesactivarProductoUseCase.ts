import { Producto } from '../../domain/entities/Producto';
import { IProductoRepository } from '../../domain/repositories/IProductoRepository';

export interface DesactivarProductoUseCaseDTO {
  id: string;
  negocioId: string;
}

export class DesactivarProductoUseCase {
  constructor(private productoRepository: IProductoRepository) {}

  async execute(input: DesactivarProductoUseCaseDTO): Promise<Producto | null> {
    return this.productoRepository.desactivar(input.id, input.negocioId);
  }
}
