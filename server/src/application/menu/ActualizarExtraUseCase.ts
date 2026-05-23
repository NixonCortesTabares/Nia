import { ActualizarExtraDTO, Extra } from '../../domain/entities/Extra';
import { IExtraRepository } from '../../domain/repositories/IExtraRepository';

export interface ActualizarExtraUseCaseDTO {
  id: string;
  negocioId: string;
  data: ActualizarExtraDTO;
}

export class ActualizarExtraUseCase {
  constructor(private extraRepository: IExtraRepository) {}

  async execute(input: ActualizarExtraUseCaseDTO): Promise<Extra | null> {
    const extra = await this.extraRepository.buscarPorId(input.id, input.negocioId);

    if (!extra) {
      return null;
    }

    if (input.data.nombre !== undefined && !input.data.nombre.trim()) {
      throw new Error('El nombre del extra no puede estar vacio');
    }

    if (input.data.valor !== undefined && input.data.valor < 0) {
      throw new Error('El valor del extra no puede ser negativo');
    }

    if (input.data.nombre !== undefined) {
      const existente = await this.extraRepository.buscarPorNombre(
        input.negocioId,
        input.data.nombre.trim()
      );

      if (existente && existente.id !== input.id) {
        throw new Error('Ya existe un extra con ese nombre');
      }
    }

    return this.extraRepository.actualizar(input.id, input.negocioId, {
      ...input.data,
      nombre: input.data.nombre?.trim(),
    });
  }
}
