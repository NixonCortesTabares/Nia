import { Categoria } from '../../domain/entities/Categoria';
import { ICategoriaRepository } from '../../domain/repositories/ICategoriaRepository';

export class ListarCategoriasUseCase {
  constructor(private categoriaRepository: ICategoriaRepository) {}

  async execute(negocioId: string): Promise<Categoria[]> {
    const resultado = await this.categoriaRepository.buscarPorNegocio(negocioId);
    if(!resultado){
      throw new Error('No se encontraron categorias para este negocio.');
    }

    return resultado;
    }
}
