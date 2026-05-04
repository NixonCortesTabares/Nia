import { CrearProfesionalDTO, Profesional } from '../../domain/entities/Profesional';
import { IProfesionalRepository } from '../../domain/repositories/IProfesionalRepository';

export class CrearProfesionalUseCase {
  constructor(private profesionalRepository: IProfesionalRepository) {}

  async execute(data: CrearProfesionalDTO): Promise<Profesional> {
    return this.profesionalRepository.crear(data);
  }
}
