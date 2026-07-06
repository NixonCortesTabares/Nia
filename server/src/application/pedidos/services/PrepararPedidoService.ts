import { metodoPago, TipoEntrega } from "../../../domain/entities/Pedido";
import { ICategoriaExtraRepository } from "../../../domain/repositories/ICategoriaExtraRepository";
import { IExtraRepository } from "../../../domain/repositories/IExtraRepository";
import { INegocioRepository } from "../../../domain/repositories/INegocioRepository";
import { CrearPedidoCompletoDTO, CrearPedidoProductoCompletoDTO } from "../../../domain/repositories/IPedidoRepository";
import { IProductoRepository } from "../../../domain/repositories/IProductoRepository";
import { GenerarPedidoUseCaseDTO, normalizarTexto } from "../GenerarPedidoUseCase";


const tiposEntregaValidos: TipoEntrega[] = ['domicilio', 'recoger_en_local', 'consumo_en_local'];
const metodosPagoValido: metodoPago[] = ['efectivo', 'transferencia']

export class PrepararPedidoService {
  constructor(
    private productoRepository: IProductoRepository,
    private extraRepository: IExtraRepository,
    private categoriaExtraRepository: ICategoriaExtraRepository,
    private negocioRepo: INegocioRepository
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

    const negocio = await this.negocioRepo.buscarPorId(input.negocioId);
    if(!negocio){
      throw new Error('No se pudo encontrar el negocio al intentar preparar el pedido');
    }
    
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

      if(typeof producto === 'string'){
        throw new Error('Error, varias opciones de productos');
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

        if(!extra){
          throw new Error('Extra no encontrado.');
        }

        if(typeof extra === 'string'){
          throw new Error('Error, varias opciones de extras');

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
    const costoDomicilio = negocio.costo_domicilio
    const totalProductos = productos.reduce((total, item) => total + item.subtotal, 0);
    const adicional = 1000 * input.items.length;; //CODIGO PENDIENTE LOL
    const total = totalProductos + adicional;

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

public async resolverProductoPorTexto(
  negocioId: string,
  textoProducto: string
) {
  const productos = await this.productoRepository.buscarActivosPorNegocio(
    negocioId
  );

  const productosActivos = productos.filter((producto) => producto.activo);

  return resolverMejorCoincidencia(
    productosActivos,
    textoProducto,
    "producto"
  );
}

 public async resolverExtraPorTexto(
  negocioId: string,
  categoriaId: string,
  textoExtra: string,
  nombreProducto: string
) {
  const extrasActivos = await this.extraRepository.buscarActivosPorNegocio(
    negocioId
  );

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

  return resolverMejorCoincidencia(
    extrasPermitidos,
    textoExtra,
    "extra",
    nombreProducto
  );
}
}

type ItemConNombre = {
  nombre: string;
};

const PALABRAS_IGNORADAS = new Set([
  "quiero",
  "quiere",
  "queria",
  "deme",
  "dame",
  "me",
  "das",
  "da",
  "un",
  "una",
  "uno",
  "la",
  "el",
  "los",
  "las",
  "de",
  "del",
  "por",
  "favor",
  "para",
  "pedido",
  "pedir",
  "con",
  "sin",
  "extra",
  "extras",
  "adicional",
  "agregale",
  "agregar",
  "añadir",
  "poner",
]);

function obtenerTokensBusqueda(texto: string): string[] {
  return normalizarTexto(texto)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .filter((token) => !PALABRAS_IGNORADAS.has(token))
    .filter((token) => token.length >= 3 || /^\d+$/.test(token));
}

function obtenerNumeros(tokens: string[]): string[] {
  return tokens.filter((token) => /^\d+$/.test(token));
}

function distanciaLevenshtein(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function similitudTexto(a: string, b: string): number {
  if (a === b) {
    return 1;
  }

  const maxLength = Math.max(a.length, b.length);

  if (maxLength === 0) {
    return 1;
  }

  return 1 - distanciaLevenshtein(a, b) / maxLength;
}

function tokenExisteParecido(token: string, tokensObjetivo: string[]): boolean {
  return tokensObjetivo.some((tokenObjetivo) => {
    if (tokenObjetivo === token) {
      return true;
    }

    if (token.length < 5 || tokenObjetivo.length < 5) {
      return false;
    }

    return similitudTexto(token, tokenObjetivo) >= 0.84;
  });
}

function calcularPuntajeCoincidencia(textoCliente: string, nombreItem: string): number {
  const textoNormalizado = normalizarTexto(textoCliente);
  const nombreNormalizado = normalizarTexto(nombreItem);

  if (!textoNormalizado || !nombreNormalizado) {
    return 0;
  }

  if (textoNormalizado === nombreNormalizado) {
    return 100;
  }

  const tokensCliente = obtenerTokensBusqueda(textoCliente);
  const tokensItem = obtenerTokensBusqueda(nombreItem);

  if (tokensCliente.length === 0 || tokensItem.length === 0) {
    return 0;
  }

  const numerosCliente = obtenerNumeros(tokensCliente);
  const numerosItem = obtenerNumeros(tokensItem);

  // Si el cliente escribió un número específico, no debe coincidir con productos de otro número.
  if (
    numerosCliente.length > 0 &&
    !numerosCliente.every((numero) => numerosItem.includes(numero))
  ) {
    return 0;
  }

  let puntaje = 0;

  if (nombreNormalizado.includes(textoNormalizado)) {
    puntaje = Math.max(puntaje, 90);
  }

  if (textoNormalizado.includes(nombreNormalizado)) {
    puntaje = Math.max(puntaje, 88);
  }

  const tokensExactos = tokensCliente.filter((token) =>
    tokensItem.includes(token)
  ).length;

  const tokensParecidos = tokensCliente.filter((token) => {
    if (tokensItem.includes(token)) {
      return false;
    }

    return tokenExisteParecido(token, tokensItem);
  }).length;

  const cobertura =
    (tokensExactos + tokensParecidos * 0.75) / tokensCliente.length;

  if (cobertura === 1) {
    puntaje = Math.max(puntaje, 78 + Math.min(tokensCliente.length * 4, 12));
  } else if (cobertura >= 0.67) {
    puntaje = Math.max(puntaje, 65);
  } else if (cobertura >= 0.5) {
    puntaje = Math.max(puntaje, 50);
  }

  if (
    numerosCliente.length > 0 &&
    numerosCliente.every((numero) => numerosItem.includes(numero))
  ) {
    puntaje += 8;
  }

  return Math.min(puntaje, 100);
}

function resolverMejorCoincidencia<T extends ItemConNombre>(
  items: T[],
  textoCliente: string,
  tipo: "producto" | "extra",
  contexto?: string
): T | null | string{
  const coincidencias = items
    .map((item) => ({
      item,
      puntaje: calcularPuntajeCoincidencia(textoCliente, item.nombre),
    }))
    .filter((match) => match.puntaje >= 45)
    .sort((a, b) => b.puntaje - a.puntaje);

  const mejor = coincidencias[0];
  const segunda = coincidencias[1];

  if (!mejor) {
    return null
  }

  const esCoincidenciaFuerte = mejor.puntaje >= 75;
  const hayAmbiguedad =
    segunda !== undefined && mejor.puntaje - segunda.puntaje <= 1;

  if (esCoincidenciaFuerte && !hayAmbiguedad) {
    return mejor.item;
  }

  const opciones = coincidencias
    .slice(0, 3)
    .map((match) => match.item.nombre)
    .join(", ");

   return opciones
  
}