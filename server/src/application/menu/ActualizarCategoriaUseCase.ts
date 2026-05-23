import { ActualizarCategoriaDTO, Categoria } from '../../domain/entities/Categoria';
import { ICategoriaRepository } from '../../domain/repositories/ICategoriaRepository';

export interface ActualizarCategoriaUseCaseDTO {
  id: string;
  negocioId: string;
  data: ActualizarCategoriaDTO;
}

export class ActualizarCategoriaUseCase {
  constructor(private categoriaRepository: ICategoriaRepository) {}

  async execute(input: ActualizarCategoriaUseCaseDTO): Promise<Categoria | null> {
    const categoria = await this.categoriaRepository.buscarPorId(input.id, input.negocioId);

    if (!categoria) {
      return null;
    }

    if (input.data.nombre !== undefined && !input.data.nombre.trim()) {
      throw new Error('El nombre de la categoria no puede estar vacio');
    }

    if (input.data.nombre !== undefined) {
      const existente = await this.categoriaRepository.buscarPorNombre(
        input.negocioId,
        input.data.nombre.trim()
      );

      if (existente && existente.id !== input.id) {
        throw new Error('Ya existe una categoria con ese nombre');
      }
    }

    return this.categoriaRepository.actualizar(input.id, input.negocioId, {
      ...input.data,
      nombre: input.data.nombre?.trim(),
    });
  }
}
