import { CrearServicioDTO, Servicio } from '../../domain/entities/Servicio';
import { IServicioRepository } from '../../domain/repositories/IServicioRepository';

export class CrearServicioUseCase {
  constructor(private servicioRepository: IServicioRepository) {}

  async execute(data: CrearServicioDTO): Promise<Servicio> {
    return this.servicioRepository.crear(data);
  }
}
