import { CrearPedidoProductoDTO, PedidoProducto } from '../entities/PedidoProducto';

export interface IPedidoProductoRepository {
  crear(data: CrearPedidoProductoDTO): Promise<PedidoProducto>;
  buscarPorPedido(negocioId: string, pedidoId: string): Promise<PedidoProducto[]>;
  buscarPorId(id: string, negocioId: string): Promise<PedidoProducto | null>;
}
