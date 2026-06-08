import { metodoPago, TipoEntrega } from "../../../domain/entities/Pedido";
import { ICategoriaExtraRepository } from "../../../domain/repositories/ICategoriaExtraRepository";
import { IExtraRepository } from "../../../domain/repositories/IExtraRepository";
import { CrearPedidoCompletoDTO, CrearPedidoProductoCompletoDTO } from "../../../domain/repositories/IPedidoRepository";
import { IProductoRepository } from "../../../domain/repositories/IProductoRepository";
import { GenerarPedidoUseCaseDTO, normalizarTexto } from "../GenerarPedidoUseCase";


const tiposEntregaValidos: TipoEntrega[] = ['domicilio', 'recoger_en_local', 'consumo_en_local'];
const metodosPagoValido: metodoPago[] = ['efectivo', 'transferencia']

export class PrepararPedidoService {
  constructor(
    private productoRepository: IProductoRepository,
    private extraRepository: IExtraRepository,
    private categoriaExtraRepository: ICategoriaExtraRepository
  ) { }

  async execute(input: GenerarPedidoUseCaseDTO): Promise<CrearPedidoCompletoDTO> {
    if (!input.negocioId || !input.clienteId || !input.conversacionId) {
      throw new Error('Faltan datos internos para crear el pedido.');
    }
    if (!(typeof input.nombreCliente === 'string' && input.nombreCliente.trim().length > 0)) {
      throw new Error("Error al crear el pedido, necesitas el nombre del cliente.");
    }
    const nombreCliente: string = input.nombreCliente.trim();

    if (!(typeof input.telefonoCliente === 'string' && input.telefonoCliente.trim().length > 0)) {
      throw new Error("Error al crear el pedido, necesitas el telefono del cliente.");
    }
    const telefonoCliente: string = input.telefonoCliente.trim();

    if (!(typeof input.metodoPago === 'string' && input.metodoPago.trim().length > 0)) {
      throw new Error("Error al crear el pedido, necesitas el metodo de Pago")
    }
    const metodoPagoNormalizado: metodoPago = input.metodoPago.trim().toLowerCase() as metodoPago;

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

      const producto = await this.resolverProductoPorTexto(
        input.negocioId,
        nombreProducto
      );

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

        const extra = await this.resolverExtraPorTexto(
          input.negocioId,
          producto.categoriaId,
          nombreExtra,
          producto.nombre
        );

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

    return ({
      pedido: {
        negocioId: input.negocioId,
        clienteId: input.clienteId,
        conversacionId: input.conversacionId,
        nombreCliente: nombreCliente,
        telefonoCliente: telefonoCliente,
        tipoEntrega: tipoEntregaNormalizado,
        direccionEntrega: direccionEntregaNormalizada,
        metodoPago: metodoPagoNormalizado,
        costoDomicilio: costoDomicilio,
        total: total,
        notas: notasPedido
      },
      productos
    })
  }

  private async resolverProductoPorTexto(
    negocioId: string,
    textoProducto: string
  ) {
    const textoNormalizado = normalizarTexto(textoProducto);

    const productos = await this.productoRepository.buscarActivosPorNegocio(negocioId);

    const productosActivos = productos.filter((producto) => producto.activo);

    const exactos = productosActivos.filter(
      (producto) => normalizarTexto(producto.nombre) === textoNormalizado
    );

    if (exactos.length === 1) {
      return exactos[0];
    }

    if (exactos.length > 1) {
      throw new Error(
        `Encontré varias coincidencias exactas para "${textoProducto}": ${exactos
          .map((p) => p.nombre)
          .join(', ')}. Pide al cliente que aclare cuál desea.`
      );
    }

    const tokens = textoNormalizado
      .split(' ')
      .map((token) => token.trim())
      .filter((token) => token.length >= 3);

    const coincidencias = productosActivos.filter((producto) => {
      const nombreNormalizado = normalizarTexto(producto.nombre);

      if (nombreNormalizado.includes(textoNormalizado)) {
        return true;
      }

      if (textoNormalizado.includes(nombreNormalizado)) {
        return true;
      }

      if (tokens.length > 0 && tokens.every((token) => nombreNormalizado.includes(token))) {
        return true;
      }

      return false;
    });

    if (coincidencias.length === 1) {
      return coincidencias[0];
    }

    if (coincidencias.length > 1) {
      throw new Error(
        `Encontré varias opciones para "${textoProducto}": ${coincidencias
          .map((p) => p.nombre)
          .join(', ')}. Pide al cliente que indique cuál desea.`
      );
    }

    throw new Error(`Producto no encontrado: ${textoProducto}`);
  }

  private async resolverExtraPorTexto(
    negocioId: string,
    categoriaId: string,
    textoExtra: string,
    nombreProducto: string
  ) {
    const textoNormalizado = normalizarTexto(textoExtra);

    const extrasActivos = await this.extraRepository.buscarActivosPorNegocio(negocioId);

    const extrasPermitidos = [];

    for (const extra of extrasActivos) {
      const permitido = await this.categoriaExtraRepository.existeActiva(
        negocioId,
        categoriaId,
        extra.id
      );

      if (permitido) {
        extrasPermitidos.push(extra);
      }
    }

    const exactos = extrasPermitidos.filter(
      (extra) => normalizarTexto(extra.nombre) === textoNormalizado
    );

    if (exactos.length === 1) {
      return exactos[0];
    }

    if (exactos.length > 1) {
      throw new Error(
        `Encontré varias coincidencias exactas para el extra "${textoExtra}" en ${nombreProducto}: ${exactos
          .map((e) => e.nombre)
          .join(', ')}. Pide al cliente que aclare cuál desea.`
      );
    }

    const tokens = textoNormalizado
      .split(' ')
      .map((token) => token.trim())
      .filter((token) => token.length >= 3);

    const coincidencias = extrasPermitidos.filter((extra) => {
      const nombreNormalizado = normalizarTexto(extra.nombre);

      if (nombreNormalizado.includes(textoNormalizado)) {
        return true;
      }

      if (textoNormalizado.includes(nombreNormalizado)) {
        return true;
      }

      if (tokens.length > 0 && tokens.every((token) => nombreNormalizado.includes(token))) {
        return true;
      }

      return false;
    });

    if (coincidencias.length === 1) {
      return coincidencias[0];
    }

    if (coincidencias.length > 1) {
      throw new Error(
        `Encontré varias opciones para el extra "${textoExtra}" en ${nombreProducto}: ${coincidencias
          .map((e) => e.nombre)
          .join(', ')}. Pide al cliente que indique cuál desea.`
      );
    }

    throw new Error(
      `No encontré el extra "${textoExtra}" disponible para ${nombreProducto}.`
    );
  }
}