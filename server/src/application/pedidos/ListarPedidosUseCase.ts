import { Pedido } from '../../domain/entities/Pedido';
import { IPedidoRepository } from '../../domain/repositories/IPedidoRepository';

export class ListarPedidosUseCase {
  constructor(private pedidoRepository: IPedidoRepository) {}

  async execute(negocioId: string): Promise<Pedido[]> {
    return this.pedidoRepository.buscarPorNegocio(negocioId);
  }
}
