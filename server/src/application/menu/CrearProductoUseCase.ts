import { Producto } from '../../domain/entities/Producto';
import { ICategoriaRepository } from '../../domain/repositories/ICategoriaRepository';
import { IProductoRepository } from '../../domain/repositories/IProductoRepository';

export interface CrearProductoUseCaseDTO {
  negocioId: string;
  categoriaId: string;
  nombre: string;
  ingredientes: string;
  descripcion: string;
  valor: number;
}

export class CrearProductoUseCase {
  constructor(
    private productoRepository: IProductoRepository,
    private categoriaRepository: ICategoriaRepository
  ) {}

  async execute(input: CrearProductoUseCaseDTO): Promise<Producto> {
    
    if (!input.nombre) {
      throw new Error('El nombre del producto es obligatorio');
    }

    const nombre = input.nombre.trim();

    if (nombre.length < 2) {
      throw new Error('El nombre del producto es obligatorio');
    }


    if (!input.valor || input.valor <= 0 ) {
      throw new Error('Debe proporcionar el valor del producto, y este no puede ser negativo o cero');
    }

    const categoria = await this.categoriaRepository.buscarPorId(input.categoriaId, input.negocioId);

    if (!categoria) {
      throw new Error('Categoria no encontrada');
    }

    return this.productoRepository.crear({
      negocioId: input.negocioId,
      categoriaId: input.categoriaId,
      nombre,
      ingredientes: input.ingredientes,
      descripcion: input.descripcion,
      valor: input.valor,
    });
  }
}
