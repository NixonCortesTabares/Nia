import { PedidoBorrador, PedidoBorradorItem } from "../../domain/entities/Conversacion";
import { CategoriaExtraRepository } from "../../infraestructure/repositories/CategoriaExtraRepository";
import { ExtraRepository } from "../../infraestructure/repositories/ExtraRepository";
import { NegocioRepository } from "../../infraestructure/repositories/NegocioRepository";
import { ProductoRepository } from "../../infraestructure/repositories/ProductoRepository";
import { PrepararPedidoService } from "../pedidos/services/PrepararPedidoService";

export async function resolverPedidoBorradorUseCase(
  pedidoBorrador: PedidoBorrador,
  negocioId: string
): Promise<
  | {
      ok: true;
      pedidoBorrador: PedidoBorrador;
    }
  | {
      ok: false;
      mensajeCliente: string;
    }
> {
  if (!pedidoBorrador.items || pedidoBorrador.items.length === 0) {
    return {
      ok: true,
      pedidoBorrador,
    };
  }

  const productoRepo = new ProductoRepository();
  const extraRepo = new ExtraRepository();
  const categoriaExtraRepo = new CategoriaExtraRepository();
  const negocioRepo = new NegocioRepository();
  const resolvedor = new PrepararPedidoService(
    productoRepo,
    extraRepo,
    categoriaExtraRepo,
    negocioRepo
  );

  const itemsResueltos: PedidoBorradorItem[] = [];

  for (const item of pedidoBorrador.items) {
    const productoEncontrado = await resolvedor.resolverProductoPorTexto(
      negocioId,
      item.nombre_producto
    );

    if (!productoEncontrado) {
      return {
        ok: false,
        mensajeCliente: `corazon no le entendi, ${item.nombre_producto}" no esta en el menú. Tal vez leyó mal.`,
      };
    }

    if (typeof productoEncontrado === "string") {
      return {
        ok: false,
        mensajeCliente: `Cual de todas? tengo estas: ${productoEncontrado}. ¿Cuál deseas?`,
      };
    }

    const extrasResueltos: string[] = [];

    for (const extraTexto of item.extras ?? []) {
      const extraEncontrado = await resolvedor.resolverExtraPorTexto(
        negocioId,
        productoEncontrado.categoriaId,
        extraTexto,
        productoEncontrado.nombre
      );

      if (!extraEncontrado) {
        return {
          ok: false,
          mensajeCliente: `Ese extra "${extraTexto}" no lo tenemos disponible para ${productoEncontrado.nombre}.`,
        };
      }

      if (typeof extraEncontrado === "string") {
        return {
          ok: false,
          mensajeCliente: `Cual de todos los extras en ${productoEncontrado.nombre}: ${extraEncontrado}. Especificame mejor`,
        };
      }

      extrasResueltos.push(extraEncontrado.nombre);
    }

    itemsResueltos.push({
      nombre_producto: productoEncontrado.nombre,
      cantidad: item.cantidad,
      extras: extrasResueltos,
      notas: item.notas ?? null,
    });
  }

  return {
    ok: true,
    pedidoBorrador: {
      ...pedidoBorrador,
      items: itemsResueltos,
    },
  };
}