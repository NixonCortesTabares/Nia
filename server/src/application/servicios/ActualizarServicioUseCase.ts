import { EditarServicioDTO, Servicio } from '../../domain/entities/Servicio';
import { IServicioRepository } from '../../domain/repositories/IServicioRepository';

export interface ActualizarServicioUseCaseDTO {
  id: string;
  negocioId: string;
  data: EditarServicioDTO;
}

export class ActualizarServicioUseCase {
  constructor(private servicioRepository: IServicioRepository) {}

  async execute(input: ActualizarServicioUseCaseDTO): Promise<Servicio | null> {
    const servicio = await this.servicioRepository.buscarPorId(input.id);

    if (!servicio) {
      return null;
    }

    if (servicio.negocioId !== input.negocioId) {
      throw new Error('No autorizado');
    }

    return this.servicioRepository.actualizar(input.id, input.data);
  }
}
