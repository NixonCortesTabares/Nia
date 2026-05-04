import { Servicio } from '../../domain/entities/Servicio';
import { IServicioRepository } from '../../domain/repositories/IServicioRepository';

export interface ObtenerServicioUseCaseDTO {
  id: string;
  negocioId: string;
}

export class ObtenerServicioUseCase {
  constructor(private servicioRepository: IServicioRepository) {}

  async execute(input: ObtenerServicioUseCaseDTO): Promise<Servicio | null> {
    const servicio = await this.servicioRepository.buscarPorId(input.id);

    if (!servicio) {
      return null;
    }

    if (servicio.negocioId !== input.negocioId) {
      throw new Error('No autorizado');
    }

    return servicio;
  }
}
