import { Servicio } from '../../domain/entities/Servicio';
import { IServicioRepository } from '../../domain/repositories/IServicioRepository';

export class ListarServiciosUseCase {
  constructor(private servicioRepository: IServicioRepository) {}

  async execute(negocioId: string): Promise<Servicio[]> {
    return this.servicioRepository.buscarPorNegocio(negocioId);
  }
}
