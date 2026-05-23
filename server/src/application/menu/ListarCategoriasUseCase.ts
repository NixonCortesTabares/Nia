import { Categoria } from '../../domain/entities/Categoria';
import { ICategoriaRepository } from '../../domain/repositories/ICategoriaRepository';

export class ListarCategoriasUseCase {
  constructor(private categoriaRepository: ICategoriaRepository) {}

  async execute(negocioId: string): Promise<Categoria[]> {
    return this.categoriaRepository.buscarPorNegocio(negocioId);
  }
}
