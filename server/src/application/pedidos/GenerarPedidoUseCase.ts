import { Pedido, TipoEntrega, metodoPago } from '../../domain/entities/Pedido';
import { PedidoProducto } from '../../domain/entities/PedidoProducto';
import { PedidoProductoExtra } from '../../domain/entities/PedidoProductoExtra';
import {
  IPedidoRepository,
} from '../../domain/repositories/IPedidoRepository';
import { CategoriaExtraRepository } from '../../infraestructure/repositories/CategoriaExtraRepository';
import { ExtraRepository } from '../../infraestructure/repositories/ExtraRepository';
import { ProductoRepository } from '../../infraestructure/repositories/ProductoRepository';
import { PrepararPedidoService } from './services/PrepararPedidoService';

export interface GenerarPedidoItemInput {
  nombreProducto: string;
  cantidad: number;
  extras?: string[];
  notas?: string | null;
}

export interface GenerarPedidoUseCaseDTO {
  negocioId: string;
  clienteId: string;
  conversacionId: string;
  nombreCliente: string;
  telefonoCliente: string;
  tipoEntrega: TipoEntrega;
  direccionEntrega?: string | null;
  metodoPago: metodoPago;
  items: GenerarPedidoItemInput[];
  notas?: string | null;
}

export interface GenerarPedidoProductoResumen {
  producto: PedidoProducto;
  extras: PedidoProductoExtra[];
}

export interface GenerarPedidoResumen {
  pedido: Pedido;
  productos: GenerarPedidoProductoResumen[];
  total: number;
}

export function normalizarTexto(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export class GenerarPedidoUseCase {
  constructor(
    private pedidoRepository: IPedidoRepository,
    private prepararPedidoService: PrepararPedidoService
  ) { }

  async execute(input: GenerarPedidoUseCaseDTO): Promise<GenerarPedidoResumen> {

    const pedidoPreparado = await this.prepararPedidoService.execute(input);

    const pedidoCompleto = await this.pedidoRepository.crearCompleto(pedidoPreparado);
    return {
      pedido: pedidoCompleto.pedido,
      productos: pedidoCompleto.productos,
      total: pedidoCompleto.pedido.total,
    };
  }

  
}

