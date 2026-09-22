import { ListarPedidosFiltros } from '../../application/pedidos/ListarPedidosUseCase';
import { ActualizarPedidoDTO, CrearPedidoDTO, EstadoPedido, Pedido } from '../entities/Pedido';
import { CrearPedidoProductoDTO, PedidoProducto } from '../entities/PedidoProducto';
import {
  CrearPedidoProductoExtraDTO,
  PedidoProductoExtra,
} from '../entities/PedidoProductoExtra';

export interface CrearPedidoProductoCompletoDTO
  extends Omit<CrearPedidoProductoDTO, 'pedidoId'> {
  extras: Array<Omit<CrearPedidoProductoExtraDTO, 'pedidoProductoId'>>;
}

export interface CrearPedidoCompletoDTO {
  pedido: CrearPedidoDTO;
  productos: CrearPedidoProductoCompletoDTO[];
}

export interface PedidoProductoCompleto {
  producto: PedidoProducto;
  extras: PedidoProductoExtra[];
}

export interface PedidoCompleto {
  pedido: Pedido;
  productos: PedidoProductoCompleto[];
}

export interface IPedidoRepository {
  crear(data: CrearPedidoDTO): Promise<Pedido>;
  crearCompleto(data: CrearPedidoCompletoDTO): Promise<PedidoCompleto>;
  buscarPorNegocio(negocioId: string): Promise<Pedido[]>;
  buscarPorId(id: string, negocioId: string): Promise<Pedido | null>;
  buscarPorCliente(negocioId: string, telefonoCliente: string): Promise<Pedido[]>;
  buscarPendientesPorCliente(negocioId: string, telefonoCliente: string): Promise<Pedido | null>;
  buscarUltimoModificablePorConversacion(negocioId: string, conversacionId: string): Promise<Pedido | null>;
  buscarPorConversacion(negocioId: string, conversacionId: string): Promise<Pedido[]>;
  buscarPorEstado(negocioId: string, estado: EstadoPedido): Promise<Pedido[]>;
  actualizar(id: string, negocioId: string, data: ActualizarPedidoDTO): Promise<Pedido | null>;
  cambiarEstado(id: string, negocioId: string, estado: EstadoPedido): Promise<Pedido | null>;
  cancelarYCrearCompleto(pedidoAnteriorId: string, data: CrearPedidoCompletoDTO): Promise<PedidoCompleto>;
  buscarPorNegocioConFiltros(
    filtros: ListarPedidosFiltros
  ): Promise<{ pedidos: any[]; total: number }>;
}
