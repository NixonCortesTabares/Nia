import { Extra } from '../../domain/entities/Extra';
import { IExtraRepository } from '../../domain/repositories/IExtraRepository';

export interface CrearExtraUseCaseDTO {
  negocioId: string;
  nombre: string;
  valor: number;
}

export class CrearExtraUseCase {
  constructor(private extraRepository: IExtraRepository) {}

  async execute(input: CrearExtraUseCaseDTO): Promise<Extra> {
    const nombre = input.nombre.trim();

    if (!nombre) {
      throw new Error('El nombre del extra es obligatorio');
    }

    if (input.valor < 0) {
      throw new Error('El valor del extra no puede ser negativo');
    }

    const existente = await this.extraRepository.buscarPorNombre(input.negocioId, nombre);

    if (existente) {
      throw new Error('Ya existe un extra con ese nombre');
    }

    return this.extraRepository.crear({
      negocioId: input.negocioId,
      nombre,
      valor: input.valor,
    });
  }
}
