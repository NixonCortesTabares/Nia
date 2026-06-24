import { CategoriaExtra } from '../../domain/entities/CategoriaExtra';
import { ICategoriaExtraRepository } from '../../domain/repositories/ICategoriaExtraRepository';

export interface DesactivarCategoriaExtraUseCaseDTO {
  id: string;
  negocioId: string;
}

export class DesactivarCategoriaExtraUseCase {
  constructor(private categoriaExtraRepository: ICategoriaExtraRepository) {}

  /*async execute(input: DesactivarCategoriaExtraUseCaseDTO): Promise<CategoriaExtra | null> {
    return this.categoriaExtraRepository.desactivar(input.id, input.negocioId);*/
  }

