// application/pedidos/ListarPedidosUseCase.ts

import { IPedidoRepository } from '../../domain/repositories/IPedidoRepository';

export interface ListarPedidosFiltros {
  negocioId: string;
  estado?: string;
  rango?: string;
  desde?: string;
  hasta?: string;
  limit: number;
  offset: number;
}

export class ListarPedidosUseCase {
  constructor(private pedidoRepository: IPedidoRepository) {}

  async execute(filtros: ListarPedidosFiltros) {
    return this.pedidoRepository.buscarPorNegocioConFiltros(filtros);
  }
}