import { Extra } from '../../domain/entities/Extra';
import { IExtraRepository } from '../../domain/repositories/IExtraRepository';

export class ListarExtrasUseCase {
  constructor(private extraRepository: IExtraRepository) {}

  async execute(negocioId: string): Promise<Extra[]> {
    return this.extraRepository.buscarPorNegocio(negocioId);
  }
}
