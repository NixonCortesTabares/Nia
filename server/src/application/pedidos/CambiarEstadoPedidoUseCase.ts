import { EstadoPedido, Pedido } from '../../domain/entities/Pedido';
import { IPedidoRepository } from '../../domain/repositories/IPedidoRepository';
import { CerrarConversacionUseCase } from '../conversaciones/CerrarConversacionUseCase';

export interface CambiarEstadoPedidoUseCaseDTO {
  negocioId: string;
  pedidoId: string;
  estado: EstadoPedido;
}

export class CambiarEstadoPedidoUseCase {
  constructor(private pedidoRepository: IPedidoRepository) {}

  async execute(input: CambiarEstadoPedidoUseCaseDTO): Promise<Pedido | null> {
    const pedido = await this.pedidoRepository.buscarPorId(input.pedidoId, input.negocioId);

    if (!pedido) {
      return null;
    }
    return this.pedidoRepository.cambiarEstado(input.pedidoId, input.negocioId, input.estado);
  }
}
