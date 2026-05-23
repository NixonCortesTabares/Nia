import { Categoria } from '../../domain/entities/Categoria';
import { ICategoriaRepository } from '../../domain/repositories/ICategoriaRepository';

export interface CrearCategoriaUseCaseDTO {
  negocioId: string;
  nombre: string;
}

export class CrearCategoriaUseCase {
  constructor(private categoriaRepository: ICategoriaRepository) {}

  async execute(input: CrearCategoriaUseCaseDTO): Promise<Categoria> {
    const nombre = input.nombre.trim();

    if (!nombre) {
      throw new Error('El nombre de la categoria es obligatorio');
    }

    const existente = await this.categoriaRepository.buscarPorNombre(input.negocioId, nombre);

    if (existente) {
      throw new Error('Ya existe una categoria con ese nombre');
    }

    return this.categoriaRepository.crear({
      negocioId: input.negocioId,
      nombre,
    });
  }
}
