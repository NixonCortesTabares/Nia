import { Pedido } from '../../domain/entities/Pedido';
import { PedidoProducto } from '../../domain/entities/PedidoProducto';
import { PedidoProductoExtra } from '../../domain/entities/PedidoProductoExtra';
import { IPedidoProductoExtraRepository } from '../../domain/repositories/IPedidoProductoExtraRepository';
import { IPedidoProductoRepository } from '../../domain/repositories/IPedidoProductoRepository';
import { IPedidoRepository } from '../../domain/repositories/IPedidoRepository';

export interface ObtenerDetallePedidoUseCaseDTO {
  negocioId: string;
  pedidoId: string;
}

export interface DetallePedidoProducto {
  producto: PedidoProducto;
  extras: PedidoProductoExtra[];
}

export interface DetallePedido {
  pedido: Pedido;
  productos: DetallePedidoProducto[];
}

export class ObtenerDetallePedidoUseCase {
  constructor(
    private pedidoRepository: IPedidoRepository,
    private pedidoProductoRepository: IPedidoProductoRepository,
    private pedidoProductoExtraRepository: IPedidoProductoExtraRepository
  ) {}

  async execute(input: ObtenerDetallePedidoUseCaseDTO): Promise<DetallePedido | null> {
    const pedido = await this.pedidoRepository.buscarPorId(input.pedidoId, input.negocioId);

    if (!pedido) {
      return null;
    }

    const productos = await this.pedidoProductoRepository.buscarPorPedido(
      input.negocioId,
      input.pedidoId
    );
    const productosConExtras = await Promise.all(
      productos.map(async (producto) => ({
        producto,
        extras: await this.pedidoProductoExtraRepository.buscarPorPedidoProducto(
          input.negocioId,
          producto.id
        ),
      }))
    );

    return {
      pedido,
      productos: productosConExtras,
    };
  }
}
