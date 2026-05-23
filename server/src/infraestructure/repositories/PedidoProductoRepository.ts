import pool from '../../config/db';
import { CrearPedidoProductoDTO, PedidoProducto } from '../../domain/entities/PedidoProducto';
import { IPedidoProductoRepository } from '../../domain/repositories/IPedidoProductoRepository';

interface PedidoProductoRow {
  id: string;
  negocio_id: string;
  pedidos_id: string;
  productos_id: string;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  notas: string | null;
  creado_en: Date;
}

function mapPedidoProducto(row: PedidoProductoRow): PedidoProducto {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    pedidoId: row.pedidos_id,
    productoId: row.productos_id,
    nombreProducto: row.nombre_producto,
    cantidad: row.cantidad,
    precioUnitario: row.precio_unitario,
    subtotal: row.subtotal,
    notas: row.notas,
    creadoEn: row.creado_en,
  };
}

const pedidoProductoColumns = `id, negocio_id, pedidos_id, productos_id, nombre_producto,
  cantidad, precio_unitario, subtotal, notas, creado_en`;

export class PedidoProductoRepository implements IPedidoProductoRepository {
  async crear(data: CrearPedidoProductoDTO): Promise<PedidoProducto> {
    const result = await pool.query<PedidoProductoRow>(
      `INSERT INTO pedidos_productos (
         negocio_id, pedidos_id, productos_id, nombre_producto, cantidad, precio_unitario, subtotal, notas
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${pedidoProductoColumns}`,
      [
        data.negocioId,
        data.pedidoId,
        data.productoId,
        data.nombreProducto,
        data.cantidad,
        data.precioUnitario,
        data.subtotal,
        data.notas ?? null,
      ]
    );

    return mapPedidoProducto(result.rows[0]);
  }

  async buscarPorPedido(negocioId: string, pedidoId: string): Promise<PedidoProducto[]> {
    const result = await pool.query<PedidoProductoRow>(
      `SELECT ${pedidoProductoColumns}
       FROM pedidos_productos
       WHERE negocio_id = $1
         AND pedidos_id = $2
       ORDER BY creado_en ASC`,
      [negocioId, pedidoId]
    );

    return result.rows.map(mapPedidoProducto);
  }

  async buscarPorId(id: string, negocioId: string): Promise<PedidoProducto | null> {
    const result = await pool.query<PedidoProductoRow>(
      `SELECT ${pedidoProductoColumns}
       FROM pedidos_productos
       WHERE id = $1
         AND negocio_id = $2`,
      [id, negocioId]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapPedidoProducto(result.rows[0]);
  }
}
