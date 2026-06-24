import { IConversacionRepository } from '../../domain/repositories/IConversacionRepository';

export class ObtenerConversacionUseCase {
  constructor(
    private conversacionRepository: IConversacionRepository
  ) {}

  async execute(id: string, negocioId: string) {
    const conversacion = await this.conversacionRepository.buscarPorId(id);

    if (!conversacion || conversacion.negocioId !== negocioId) {
      return null;
    }

    return conversacion;
  }
}
