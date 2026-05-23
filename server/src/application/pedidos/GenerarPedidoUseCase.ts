import { Pedido, TipoEntrega, metodoPago } from '../../domain/entities/Pedido';
import { PedidoProducto } from '../../domain/entities/PedidoProducto';
import { PedidoProductoExtra } from '../../domain/entities/PedidoProductoExtra';
import { ICategoriaExtraRepository } from '../../domain/repositories/ICategoriaExtraRepository';
import { IExtraRepository } from '../../domain/repositories/IExtraRepository';
import {
  CrearPedidoProductoCompletoDTO,
  IPedidoRepository,
} from '../../domain/repositories/IPedidoRepository';
import { IProductoRepository } from '../../domain/repositories/IProductoRepository';

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

const tiposEntregaValidos: TipoEntrega[] = ['domicilio', 'recoger_en_local', 'consumo_en_local'];
const metodosPagoValido: metodoPago[] = ['efectivo', 'transferencia']


export class GenerarPedidoUseCase {
  constructor(
    private pedidoRepository: IPedidoRepository,
    private productoRepository: IProductoRepository,
    private extraRepository: IExtraRepository,
    private categoriaExtraRepository: ICategoriaExtraRepository
  ) { }

  async execute(input: GenerarPedidoUseCaseDTO): Promise<GenerarPedidoResumen> {

    if (!input.negocioId || !input.clienteId || !input.conversacionId) {
      throw new Error('Faltan datos internos para crear el pedido.');
    }
    if (!(typeof input.nombreCliente === 'string' && input.nombreCliente.trim().length > 0)) {
      throw new Error("Error al crear el pedido, necesitas el nombre del cliente.");
    }
    const nombreCliente = input.nombreCliente.trim();

    if (!(typeof input.telefonoCliente === 'string' && input.telefonoCliente.trim().length > 0)) {
      throw new Error("Error al crear el pedido, necesitas el telefono del cliente.");
    }
    const telefonoCliente = input.telefonoCliente.trim();

    if (!(typeof input.metodoPago === 'string' && input.metodoPago.trim().length > 0)) {
      throw new Error("Error al crear el pedido, necesitas el metodo de Pago")
    }
    const metodoPagoNormalizado = input.metodoPago.trim().toLowerCase() as metodoPago;

    if (!metodosPagoValido.includes(metodoPagoNormalizado)) {
      throw new Error("Error al crear el pedido, necesitas un metodo de Pago valido: efectivo, transferencia")
    }

    const direccionEntregaNormalizada =
      typeof input.direccionEntrega === 'string'
        ? input.direccionEntrega.trim() || null
        : null;
    const notasPedido = typeof input.notas === 'string' ? input.notas.trim() || null : null;

    if (typeof input.tipoEntrega !== 'string' || input.tipoEntrega.trim().length === 0) {
      throw new Error("Error al crear el pedido, el tipo de entrega es obligatoria");
    }

    const tipoEntregaNormalizado = input.tipoEntrega.trim().toLowerCase() as TipoEntrega;

    if (!tiposEntregaValidos.includes(tipoEntregaNormalizado)) {
      throw new Error('Tipo de entrega inválido, los validos son: domicilio, recoger_en_local, consumo_en_local');
    }

    if (!Array.isArray(input.items) || !input.items.length) {
      throw new Error('El pedido debe tener al menos un producto');
    }

    if (tipoEntregaNormalizado === 'domicilio' && !direccionEntregaNormalizada) {
      throw new Error('La direccion de entrega es obligatoria para domicilio');
    }

    const costoDomicilio = 0;
    const productos: CrearPedidoProductoCompletoDTO[] = [];

    for (const item of input.items) {
      if (!(typeof item.nombreProducto === 'string' && item.nombreProducto.trim().length > 0)) {
        throw new Error('el nombre del producto debe especificarse.')
      }
      const nombreProducto = item.nombreProducto.trim();
      const notasProducto = typeof item.notas === 'string' ? item.notas.trim() || null : null;

      if (!Number.isInteger(item.cantidad) || item.cantidad < 1) {
        throw new Error('La cantidad del producto debe ser un entero mayor o igual a 1');
      }

      if (item.extras !== undefined && !Array.isArray(item.extras)) {
        throw new Error('Los extras del producto deben ser un arreglo');
      }

      const producto = await this.productoRepository.buscarPorNombre(input.negocioId, nombreProducto);

      if (!producto) {
        throw new Error(`Producto no encontrado: ${nombreProducto}`);
      }

      if (!producto.activo) {
        throw new Error(`Producto inactivo: ${producto.nombre}`);
      }

      let subtotalExtras = 0;
      const extras: CrearPedidoProductoCompletoDTO['extras'] = [];
      const extrasNormalizados = new Set<string>();

      for (const nombreExtraInput of item.extras ?? []) {
        if (!(typeof nombreExtraInput === 'string' && nombreExtraInput.trim().length > 0)) {
          throw new Error('Error, si algun producto tiene un extra necesitas el nombre');
        }
        const nombreExtra = nombreExtraInput.trim();
        const extraNormalizado = nombreExtra.toLowerCase();

        if (extrasNormalizados.has(extraNormalizado)) {
          throw new Error(`Extra duplicado en el producto: ${nombreExtra}`);
        }

        extrasNormalizados.add(extraNormalizado);

        const extra = await this.extraRepository.buscarPorNombre(input.negocioId, nombreExtra);

        if (!extra) {
          throw new Error(`Extra no encontrado: ${nombreExtra}`);
        }

        if (!extra.activo) {
          throw new Error(`Extra inactivo: ${extra.nombre}`);
        }

        const permitido = await this.categoriaExtraRepository.existeActiva(
          input.negocioId,
          producto.categoriaId,
          extra.id
        );

        if (!permitido) {
          throw new Error(`El extra ${extra.nombre} no esta permitido para ${producto.nombre}`);
        }

        const subtotal = extra.valor * item.cantidad;
        subtotalExtras += subtotal;
        extras.push({
          negocioId: input.negocioId,
          extraId: extra.id,
          nombreExtra: extra.nombre,
          cantidad: item.cantidad,
          precioUnitario: extra.valor,
          subtotal,
        });
      }

      productos.push({
        negocioId: input.negocioId,
        productoId: producto.id,
        nombreProducto: producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: producto.valor,
        subtotal: producto.valor * item.cantidad + subtotalExtras,
        notas: notasProducto,
        extras,
      });
    }

    const totalProductos = productos.reduce((total, item) => total + item.subtotal, 0);
    const total = totalProductos + costoDomicilio;
    const pedidoCompleto = await this.pedidoRepository.crearCompleto({
      pedido: {
        negocioId: input.negocioId,
        clienteId: input.clienteId,
        conversacionId: input.conversacionId,
        nombreCliente,
        telefonoCliente,
        tipoEntrega: tipoEntregaNormalizado,
        direccionEntrega: direccionEntregaNormalizada,
        metodoPago: metodoPagoNormalizado,
        costoDomicilio,
        total,
        notas: notasPedido,
      },
      productos,
    });

    return {
      pedido: pedidoCompleto.pedido,
      productos: pedidoCompleto.productos,
      total,
    };
  }
}
