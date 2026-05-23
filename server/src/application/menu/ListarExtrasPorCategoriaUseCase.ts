import { CategoriaExtra } from '../../domain/entities/CategoriaExtra';
import { ICategoriaExtraRepository } from '../../domain/repositories/ICategoriaExtraRepository';
import { ICategoriaRepository } from '../../domain/repositories/ICategoriaRepository';

export interface ListarExtrasPorCategoriaUseCaseDTO {
  negocioId: string;
  categoriaId: string;
}

export class ListarExtrasPorCategoriaUseCase {
  constructor(
    private categoriaExtraRepository: ICategoriaExtraRepository,
    private categoriaRepository: ICategoriaRepository
  ) {}

  async execute(input: ListarExtrasPorCategoriaUseCaseDTO): Promise<CategoriaExtra[]> {
    const categoria = await this.categoriaRepository.buscarPorId(
      input.categoriaId,
      input.negocioId
    );

    if (!categoria) {
      throw new Error('Categoria no encontrada');
    }

    return this.categoriaExtraRepository.buscarPorCategoria(input.negocioId, input.categoriaId);
  }
}
