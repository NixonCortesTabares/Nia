import pool from '../../config/db';
import {
  CrearPedidoProductoExtraDTO,
  PedidoProductoExtra,
} from '../../domain/entities/PedidoProductoExtra';
import { IPedidoProductoExtraRepository } from '../../domain/repositories/IPedidoProductoExtraRepository';

interface PedidoProductoExtraRow {
  id: string;
  pedido_producto_id: string;
  extra_id: string | null;
  negocio_id: string;
  nombre_extra: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  creado_en: Date;
}

function mapPedidoProductoExtra(row: PedidoProductoExtraRow): PedidoProductoExtra {
  return {
    id: row.id,
    pedidoProductoId: row.pedido_producto_id,
    extraId: row.extra_id,
    negocioId: row.negocio_id,
    nombreExtra: row.nombre_extra,
    cantidad: row.cantidad,
    precioUnitario: row.precio_unitario,
    subtotal: row.subtotal,
    creadoEn: row.creado_en,
  };
}

const pedidoProductoExtraColumns = `id, pedido_producto_id, extra_id, negocio_id, nombre_extra,
  cantidad, precio_unitario, subtotal, creado_en`;

export class PedidoProductoExtraRepository implements IPedidoProductoExtraRepository {
  async crear(data: CrearPedidoProductoExtraDTO): Promise<PedidoProductoExtra> {
    const result = await pool.query<PedidoProductoExtraRow>(
      `INSERT INTO pedidos_productos_extras (
         pedido_producto_id, extra_id, negocio_id, nombre_extra, cantidad, precio_unitario, subtotal
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${pedidoProductoExtraColumns}`,
      [
        data.pedidoProductoId,
        data.extraId,
        data.negocioId,
        data.nombreExtra,
        data.cantidad,
        data.precioUnitario,
        data.subtotal,
      ]
    );

    return mapPedidoProductoExtra(result.rows[0]);
  }

  async buscarPorPedidoProducto(
    negocioId: string,
    pedidoProductoId: string
  ): Promise<PedidoProductoExtra[]> {
    const result = await pool.query<PedidoProductoExtraRow>(
      `SELECT ${pedidoProductoExtraColumns}
       FROM pedidos_productos_extras
       WHERE negocio_id = $1
         AND pedido_producto_id = $2
       ORDER BY creado_en ASC`,
      [negocioId, pedidoProductoId]
    );

    return result.rows.map(mapPedidoProductoExtra);
  }

  async buscarPorId(id: string, negocioId: string): Promise<PedidoProductoExtra | null> {
    const result = await pool.query<PedidoProductoExtraRow>(
      `SELECT ${pedidoProductoExtraColumns}
       FROM pedidos_productos_extras
       WHERE id = $1
         AND negocio_id = $2`,
      [id, negocioId]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapPedidoProductoExtra(result.rows[0]);
  }
}
