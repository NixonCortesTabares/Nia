import {
  CrearPedidoProductoExtraDTO,
  PedidoProductoExtra,
} from '../entities/PedidoProductoExtra';

export interface IPedidoProductoExtraRepository {
  crear(data: CrearPedidoProductoExtraDTO): Promise<PedidoProductoExtra>;
  buscarPorPedidoProducto(
    negocioId: string,
    pedidoProductoId: string
  ): Promise<PedidoProductoExtra[]>;
  buscarPorId(id: string, negocioId: string): Promise<PedidoProductoExtra | null>;
}
