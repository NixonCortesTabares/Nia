import { IConversacionRepository } from '../../domain/repositories/IConversacionRepository';

export class TomarControlConversacionUseCase {
  constructor(
    private conversacionRepository: IConversacionRepository
  ) {}

  async execute(id: string, negocioId: string) {
    const conversacion = await this.conversacionRepository.buscarPorId(id);

    if (!conversacion || conversacion.negocioId !== negocioId) {
      return null;
    }

    return this.conversacionRepository.actualizar(id, {
      estado: 'escalada',
      ultimoMensajeEn: new Date(),
    });
  }
}
