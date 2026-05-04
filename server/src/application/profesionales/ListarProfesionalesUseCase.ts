import { Profesional } from '../../domain/entities/Profesional';
import { IProfesionalRepository } from '../../domain/repositories/IProfesionalRepository';

export class ListarProfesionalesUseCase {
  constructor(private profesionalRepository: IProfesionalRepository) {}

  async execute(negocioId: string): Promise<Profesional[]> {
    return this.profesionalRepository.buscarPorNegocio(negocioId);
  }
}
