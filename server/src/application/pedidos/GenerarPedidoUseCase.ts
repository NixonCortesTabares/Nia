import { Pedido, TipoEntrega, metodoPago } from '../../domain/entities/Pedido';
import { PedidoProducto } from '../../domain/entities/PedidoProducto';
import { PedidoProductoExtra } from '../../domain/entities/PedidoProductoExtra';
import { IClienteRepository } from '../../domain/repositories/IClienteRepository';
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
    // Separa nombres tipo SuperMegaHiperGiga -> Super Mega Hiper Giga
    .replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, "$1 $2")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

    // 4k, 4 k, 10k -> 4000, 10000
    .replace(/\b(\d+)\s*k\b/g, (_match, numero: string) => {
      return String(Number(numero) * 1000);
    })

    // Casos escritos en palabras
    .replace(/\bcuatro\s+mil\b/g, "4000")
    .replace(/\b4\s+mil\b/g, "4000")

    // Sinónimos y errores comunes
    .replace(/\bburger\b/g, "hamburguesa")
    .replace(/\bburguer\b/g, "hamburguesa")
    .replace(/\bhamburgesa\b/g, "hamburguesa")
    .replace(/\bhamburgueza\b/g, "hamburguesa")
    .replace(/\bsalchi\b/g, "salchipapa")

    // Limpieza general
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export class GenerarPedidoUseCase {
  constructor(
    private pedidoRepository: IPedidoRepository,
    private prepararPedidoService: PrepararPedidoService,
    private clienteRepo: IClienteRepository
  ) { }

  async execute(input: GenerarPedidoUseCaseDTO): Promise<GenerarPedidoResumen> {

    const pedidoPreparado = await this.prepararPedidoService.execute(input);
    const clienteTel = await this.clienteRepo.buscarPorId(pedidoPreparado.pedido.clienteId);
    console.log(clienteTel)
    if (!clienteTel) {
      const pedidoCompleto = await this.pedidoRepository.crearCompleto(pedidoPreparado);
      return {
        pedido: pedidoCompleto.pedido,
        productos: pedidoCompleto.productos,
        total: pedidoCompleto.pedido.total,
      };
    }
    else {
      const pedidoPendiente = await this.pedidoRepository.buscarPendientesPorCliente(pedidoPreparado.pedido.negocioId, clienteTel?.telefono);
      if (!pedidoPendiente) {
        const pedidoCompleto = await this.pedidoRepository.crearCompleto(pedidoPreparado);
        return {
          pedido: pedidoCompleto.pedido,
          productos: pedidoCompleto.productos,
          total: pedidoCompleto.pedido.total,
        };
      }
      else{
        throw new Error('El cliente ya tiene un pedido pendiente.')
      }
    }


  }


}

