import { ActualizarProductoDTO, Producto } from '../../domain/entities/Producto';
import { ICategoriaRepository } from '../../domain/repositories/ICategoriaRepository';
import { IProductoRepository } from '../../domain/repositories/IProductoRepository';
import { AppError } from '../../infraestructure/http/AppError';

export interface ActualizarProductoUseCaseDTO {
  id: string;
  negocioId: string;
  data: ActualizarProductoDTO;
}

export class ActualizarProductoUseCase {
  constructor(
    private productoRepository: IProductoRepository,
    private categoriaRepository: ICategoriaRepository
  ) {}

  async execute(input: ActualizarProductoUseCaseDTO): Promise<Producto | null> {
    const producto = await this.productoRepository.buscarPorId(input.id, input.negocioId);

    if (!producto) {
      throw new Error('Este producto no existe.');
    }

    if (input.data.nombre !== undefined && !input.data.nombre.trim()) {
      throw new Error('El nombre del producto no puede estar vacio');
    }

    if (input.data.valor !== undefined && input.data.valor < 0) {
      throw new Error('El valor del producto no puede ser negativo');
    }

    if (input.data.categoriaId !== undefined) {
      const categoria = await this.categoriaRepository.buscarPorId(
        input.data.categoriaId,
        input.negocioId
      );

      if (!categoria) {
        throw new Error('Categoria no encontrada');
      }
    }

    return this.productoRepository.actualizar(input.id, input.negocioId, {
      ...input.data,
      nombre: input.data.nombre?.trim(),
    });
  }
}
