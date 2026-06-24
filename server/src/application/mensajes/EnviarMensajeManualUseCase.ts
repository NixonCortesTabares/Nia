import { enviarMensaje } from '../../agent/whatsapp';
import { IClienteRepository } from '../../domain/repositories/IClienteRepository';
import { IConversacionRepository } from '../../domain/repositories/IConversacionRepository';
import { IMensajeRepository } from '../../domain/repositories/IMensajeRepository';
import { INegocioRepository } from '../../domain/repositories/INegocioRepository';

export class EnviarMensajeManualUseCase {
  constructor(
    private conversacionRepository: IConversacionRepository,
    private mensajeRepository: IMensajeRepository,
    private negocioRepository: INegocioRepository,
    private clienteRepository: IClienteRepository
  ) {}

  async execute(input: {
    conversacionId: string;
    negocioId: string;
    contenido: string;
  }) {
    const contenido = input.contenido.trim();

    if (!contenido) {
      throw new Error('El contenido del mensaje es obligatorio.');
    }

    const conversacion = await this.conversacionRepository.buscarPorId(
      input.conversacionId
    );

    if (!conversacion || conversacion.negocioId !== input.negocioId) {
      return null;
    }

    if (conversacion.estado !== 'escalada') {
      throw new Error('Primero debes tomar el control de la conversación.');
    }

    const negocio = await this.negocioRepository.buscarPorId(input.negocioId);

    if (!negocio?.telefonoWs) {
      throw new Error('El negocio no tiene phone_number_id configurado.');
    }

    const cliente = await this.clienteRepository.buscarPorId(conversacion.clienteId);

    if (!cliente || cliente.negocioId !== input.negocioId) {
      return null;
    }

    const wamid = await enviarMensaje(cliente.telefono, contenido, negocio.telefonoWs);

    const mensaje = await this.mensajeRepository.crear(
      {
        conversacionId: conversacion.id,
        rol: 'agente',
        contenido,
        wamid,
      },
      input.negocioId
    );

    await this.conversacionRepository.actualizar(conversacion.id, {
      ultimoMensajeEn: new Date(),
    });

    return mensaje;
  }
}
