import { Categoria } from '../../domain/entities/Categoria';
import { ICategoriaRepository } from '../../domain/repositories/ICategoriaRepository';

export interface DesactivarCategoriaUseCaseDTO {
  id: string;
  negocioId: string;
}

export class DesactivarCategoriaUseCase {
  constructor(private categoriaRepository: ICategoriaRepository) {}

  async execute(input: DesactivarCategoriaUseCaseDTO): Promise<Categoria | null> {
    return this.categoriaRepository.desactivar(input.id, input.negocioId);
  }
}
