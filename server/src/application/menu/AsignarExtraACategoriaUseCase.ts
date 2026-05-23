import { CategoriaExtra } from '../../domain/entities/CategoriaExtra';
import { ICategoriaExtraRepository } from '../../domain/repositories/ICategoriaExtraRepository';
import { ICategoriaRepository } from '../../domain/repositories/ICategoriaRepository';
import { IExtraRepository } from '../../domain/repositories/IExtraRepository';

export interface AsignarExtraACategoriaUseCaseDTO {
  negocioId: string;
  categoriaId: string;
  extraId: string;
}

export class AsignarExtraACategoriaUseCase {
  constructor(
    private categoriaExtraRepository: ICategoriaExtraRepository,
    private categoriaRepository: ICategoriaRepository,
    private extraRepository: IExtraRepository
  ) {}

  async execute(input: AsignarExtraACategoriaUseCaseDTO): Promise<CategoriaExtra> {
    const categoria = await this.categoriaRepository.buscarPorId(
      input.categoriaId,
      input.negocioId
    );

    if (!categoria) {
      throw new Error('Categoria no encontrada');
    }

    const extra = await this.extraRepository.buscarPorId(input.extraId, input.negocioId);

    if (!extra) {
      throw new Error('Extra no encontrado');
    }

    const relaciones = await this.categoriaExtraRepository.buscarPorCategoria(
      input.negocioId,
      input.categoriaId
    );
    const existente = relaciones.find((relacion) => relacion.extraId === input.extraId);

    if (existente) {
      if (existente.activo) {
        return existente;
      }

      const reactivada = await this.categoriaExtraRepository.actualizar(
        existente.id,
        input.negocioId,
        { activo: true }
      );

      if (!reactivada) {
        throw new Error('No se pudo reactivar la relacion categoria-extra');
      }

      return reactivada;
    }

    return this.categoriaExtraRepository.crear({
      negocioId: input.negocioId,
      categoriaId: input.categoriaId,
      extraId: input.extraId,
    });
  }
}
