import { IConversacionRepository } from '../../domain/repositories/IConversacionRepository';
import { IMensajeRepository } from '../../domain/repositories/IMensajeRepository';

export class ListarMensajesConversacionUseCase {
  constructor(
    private conversacionRepository: IConversacionRepository,
    private mensajeRepository: IMensajeRepository
  ) {}

  async execute(conversacionId: string, negocioId: string) {
    const conversacion = await this.conversacionRepository.buscarPorId(conversacionId);

    if (!conversacion || conversacion.negocioId !== negocioId) {
      return null;
    }

    return this.mensajeRepository.buscarPorConversacion(conversacionId, negocioId);
  }
}
