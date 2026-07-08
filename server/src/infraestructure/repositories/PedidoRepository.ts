import { ListarPedidosFiltros } from '../../application/pedidos/ListarPedidosUseCase';
import pool from '../../config/db';
import {
  ActualizarPedidoDTO,
  CrearPedidoDTO,
  EstadoPedido,
  Pedido,
  TipoEntrega,
  metodoPago
} from '../../domain/entities/Pedido';
import { PedidoProducto } from '../../domain/entities/PedidoProducto';
import { PedidoProductoExtra } from '../../domain/entities/PedidoProductoExtra';
import {
  CrearPedidoCompletoDTO,
  IPedidoRepository,
  PedidoCompleto,
} from '../../domain/repositories/IPedidoRepository';

interface PedidoRow {
  id: string;
  negocio_id: string;
  cliente_id: string;
  conversacion_id: string;
  nombre_cliente: string;
  telefono_cliente: string;
  tipo_entrega: TipoEntrega;
  direccion_entrega: string | null;
  metodo_pago: metodoPago;
  costo_domicilio: string;
  total: number;
  estado: EstadoPedido;
  notas: string | null;
  creado_en: Date;
}

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

function mapPedido(row: PedidoRow): Pedido {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    clienteId: row.cliente_id,
    conversacionId: row.conversacion_id,
    nombreCliente: row.nombre_cliente,
    telefonoCliente: row.telefono_cliente,
    tipoEntrega: row.tipo_entrega,
    direccionEntrega: row.direccion_entrega,
    metodoPago: row.metodo_pago,
    costoDomicilio: row.costo_domicilio,
    total: row.total,
    estado: row.estado,
    notas: row.notas,
    creadoEn: row.creado_en,
  };
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

const pedidoColumns = `id, negocio_id, cliente_id, conversacion_id, nombre_cliente, telefono_cliente,
  tipo_entrega, direccion_entrega, metodo_pago, costo_domicilio, total, estado, notas, creado_en`;
const pedidoProductoColumns = `id, negocio_id, pedidos_id, productos_id, nombre_producto,
  cantidad, precio_unitario, subtotal, notas, creado_en`;
const pedidoProductoExtraColumns = `id, pedido_producto_id, extra_id, negocio_id, nombre_extra,
  cantidad, precio_unitario, subtotal, creado_en`;

export class PedidoRepository implements IPedidoRepository {

  async buscarPorNegocioConFiltros(filtros: ListarPedidosFiltros): Promise<any[]> {
    try {
      const condiciones: string[] = ['p.negocio_id = $1'];
      const values: any[] = [filtros.negocioId];

      let paramIndex = 2;

      if (filtros.estado) {
        condiciones.push(`p.estado = $${paramIndex}`);
        values.push(filtros.estado);
        paramIndex++;
      }

      if (filtros.rango) {
        if (filtros.rango === 'hoy') {
          condiciones.push(`
            p.creado_en >= (((NOW() AT TIME ZONE 'America/Bogota')::date AT TIME ZONE 'America/Bogota') AT TIME ZONE 'UTC')
            AND p.creado_en < ((((NOW() AT TIME ZONE 'America/Bogota')::date + INTERVAL '1 day') AT TIME ZONE 'America/Bogota') AT TIME ZONE 'UTC')
          `);
        }

        if (filtros.rango === '7d') {
          condiciones.push(`p.creado_en >= NOW() - INTERVAL '7 days'`);
        }

        if (filtros.rango === '30d') {
          condiciones.push(`p.creado_en >= NOW() - INTERVAL '30 days'`);
        }

        if (filtros.rango === 'mes') {
          condiciones.push(`p.creado_en >= date_trunc('month', NOW())`);
        }
      }

      if (filtros.desde) {
        condiciones.push(`p.creado_en >= $${paramIndex}`);
        values.push(filtros.desde);
        paramIndex++;
      }

      if (filtros.hasta) {
        condiciones.push(`p.creado_en <= $${paramIndex}`);
        values.push(filtros.hasta);
        paramIndex++;
      }

      const limitIndex = paramIndex;
      values.push(filtros.limit);
      paramIndex++;

      const offsetIndex = paramIndex;
      values.push(filtros.offset);

      const result = await pool.query(
        `
      WITH pedidos_filtrados AS (
        SELECT
          p.id,
          p.negocio_id,
          p.estado,
          p.tipo_entrega,
          p.direccion_entrega,
          p.metodo_pago,
          p.total,
          p.costo_domicilio,
          p.creado_en,
          p.nombre_cliente AS cliente_nombre,
          p.telefono_cliente AS cliente_telefono
        FROM pedidos p
        WHERE ${condiciones.join(' AND ')}
        ORDER BY p.creado_en DESC
        LIMIT $${limitIndex}
        OFFSET $${offsetIndex}
      ),

      productos_con_extras AS (
        SELECT
          pp.id AS pedido_producto_id,
          pp.pedidos_id,
          pp.nombre_producto,
          pp.precio_unitario,
          pp.cantidad,
          pp.subtotal,
          pp.notas,

          COALESCE(
            jsonb_agg(
              jsonb_build_object(
                'nombreExtra', ppe.nombre_extra,
                'cantidad', ppe.cantidad,
                'precioUnitario', ppe.precio_unitario,
                'subtotal', ppe.subtotal
              )
              ORDER BY ppe.nombre_extra ASC
            ) FILTER (WHERE ppe.id IS NOT NULL),
            '[]'::jsonb
          ) AS extras

        FROM pedidos_productos pp

        LEFT JOIN pedidos_productos_extras ppe
          ON ppe.pedido_producto_id = pp.id
         AND ppe.negocio_id = pp.negocio_id

        WHERE pp.pedidos_id IN (
          SELECT id FROM pedidos_filtrados
        )

        GROUP BY
          pp.id,
          pp.pedidos_id,
          pp.nombre_producto,
          pp.precio_unitario,
          pp.cantidad,
          pp.subtotal,
          pp.notas
      )

      SELECT
        pf.id,
        pf.estado,
        pf.tipo_entrega,
        pf.direccion_entrega,
        pf.metodo_pago,
        pf.total,
        pf.costo_domicilio,
        pf.creado_en,
        pf.cliente_nombre,
        pf.cliente_telefono,

        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'nombreProducto', pce.nombre_producto,
              'precioUnitario', pce.precio_unitario,
              'cantidad', pce.cantidad,
              'subtotal', pce.subtotal,
              'notas', pce.notas,
              'extras', pce.extras
            )
            ORDER BY pce.nombre_producto ASC
          ) FILTER (WHERE pce.pedido_producto_id IS NOT NULL),
          '[]'::jsonb
        ) AS productos

      FROM pedidos_filtrados pf

      LEFT JOIN productos_con_extras pce
        ON pce.pedidos_id = pf.id

      GROUP BY
        pf.id,
        pf.estado,
        pf.tipo_entrega,
        pf.direccion_entrega,
        pf.metodo_pago,
        pf.total,
        pf.costo_domicilio,
        pf.creado_en,
        pf.cliente_nombre,
        pf.cliente_telefono

      ORDER BY pf.creado_en DESC
      `,
        values
      );

      return result.rows.map((row) => ({
        id: row.id,
        estado: row.estado,
        tipoEntrega: row.tipo_entrega,
        direccionEntrega: row.direccion_entrega,
        metodoPago: row.metodo_pago,
        total: Number(row.total),
        costoDomicilio: row.costo_domicilio,
        creadoEn: row.creado_en,
        cliente: {
          nombre: row.cliente_nombre,
          telefono: row.cliente_telefono,
        },
        productos: row.productos.map((producto: any) => ({
          nombreProducto: producto.nombreProducto,
          precioUnitario: Number(producto.precioUnitario),
          cantidad: Number(producto.cantidad),
          subtotal: Number(producto.subtotal),
          notas: producto.notas,
          extras: Array.isArray(producto.extras)
            ? producto.extras.map((extra: any) => ({
              nombreExtra: extra.nombreExtra,
              cantidad: Number(extra.cantidad),
              precioUnitario: Number(extra.precioUnitario),
              subtotal: Number(extra.subtotal),
            }))
            : [],
        })),
      }));
    } catch (error) {
      console.error('Error DB buscando pedidos con filtros:', error);
      throw new Error('Error interno del servidor.');
    }
  }
  async buscarPendientesPorCliente(negocioId: string, telefonoCliente: string): Promise<Pedido | null> {
    const result = await pool.query<PedidoRow>(
      `SELECT p.id, p.negocio_id, p.cliente_id, p.conversacion_id, p.nombre_cliente, p.telefono_cliente,
  p.tipo_entrega, p.direccion_entrega, p.metodo_pago, p.costo_domicilio, p.total, p.estado, p.notas, p.creado_en
   FROM pedidos p
   INNER JOIN clientes c
     ON c.id = p.cliente_id
    AND c.negocio_id = p.negocio_id
   WHERE p.negocio_id = $1
     AND c.telefono = $2
     AND p.estado IN ('pendiente', 'en_cocina', 'en_ruta')
   ORDER BY p.creado_en DESC
   LIMIT 1`,
      [negocioId, telefonoCliente]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapPedido(result.rows[0]);
  }

  async buscarUltimoModificablePorConversacion(
    negocioId: string,
    conversacionId: string
  ): Promise<Pedido | null> {
    const result = await pool.query<PedidoRow>(
      `SELECT ${pedidoColumns}
       FROM pedidos
       WHERE negocio_id = $1
         AND conversacion_id = $2
         AND estado IN ('pendiente', 'en_cocina', 'en_ruta')
       ORDER BY creado_en DESC
       LIMIT 1`,
      [negocioId, conversacionId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapPedido(result.rows[0]);
  }

  async crear(data: CrearPedidoDTO): Promise<Pedido> {
    const result = await pool.query<PedidoRow>(
      `INSERT INTO pedidos (
         negocio_id, cliente_id, conversacion_id, nombre_cliente, telefono_cliente,
         tipo_entrega, direccion_entrega, metodo_pago, costo_domicilio, total, notas
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING ${pedidoColumns}`,
      [
        data.negocioId,
        data.clienteId,
        data.conversacionId,
        data.nombreCliente,
        data.telefonoCliente,
        data.tipoEntrega,
        data.direccionEntrega,
        data.metodoPago,
        data.costoDomicilio,
        data.total,
        data.notas,
      ]
    );

    return mapPedido(result.rows[0]);
  }

  async crearCompleto(data: CrearPedidoCompletoDTO): Promise<PedidoCompleto> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const pedidoResult = await client.query<PedidoRow>(
        `INSERT INTO pedidos (
           negocio_id, cliente_id, conversacion_id, nombre_cliente, telefono_cliente,
           tipo_entrega, direccion_entrega, metodo_pago, costo_domicilio, total, notas, estado
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pendiente')
         RETURNING ${pedidoColumns}`,
        [
          data.pedido.negocioId,
          data.pedido.clienteId,
          data.pedido.conversacionId,
          data.pedido.nombreCliente,
          data.pedido.telefonoCliente,
          data.pedido.tipoEntrega,
          data.pedido.direccionEntrega,
          data.pedido.metodoPago,
          data.pedido.costoDomicilio,
          data.pedido.total,
          data.pedido.notas,
        ]
      );
      const pedido = mapPedido(pedidoResult.rows[0]);
      const productos: PedidoCompleto['productos'] = [];

      for (const item of data.productos) {
        const productoResult = await client.query<PedidoProductoRow>(
          `INSERT INTO pedidos_productos (
             negocio_id, pedidos_id, productos_id, nombre_producto, cantidad, precio_unitario, subtotal, notas
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING ${pedidoProductoColumns}`,
          [
            pedido.negocioId,
            pedido.id,
            item.productoId,
            item.nombreProducto,
            item.cantidad,
            item.precioUnitario,
            item.subtotal,
            item.notas ?? null,
          ]
        );
        const producto = mapPedidoProducto(productoResult.rows[0]);
        const extras: PedidoProductoExtra[] = [];

        for (const extra of item.extras) {
          const extraResult = await client.query<PedidoProductoExtraRow>(
            `INSERT INTO pedidos_productos_extras (
               pedido_producto_id, extra_id, negocio_id, nombre_extra, cantidad, precio_unitario, subtotal
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING ${pedidoProductoExtraColumns}`,
            [
              producto.id,
              extra.extraId,
              pedido.negocioId,
              extra.nombreExtra,
              extra.cantidad,
              extra.precioUnitario,
              extra.subtotal,
            ]
          );
          extras.push(mapPedidoProductoExtra(extraResult.rows[0]));
        }

        productos.push({ producto, extras });
      }

      await client.query('COMMIT');

      return { pedido, productos };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async buscarPorNegocio(negocioId: string): Promise<Pedido[]> {
    const result = await pool.query<PedidoRow>(
      `SELECT ${pedidoColumns}
       FROM pedidos
       WHERE negocio_id = $1
       ORDER BY creado_en DESC`,
      [negocioId]
    );

    return result.rows.map(mapPedido);
  }

  async buscarPorId(id: string, negocioId: string): Promise<Pedido | null> {
    const result = await pool.query<PedidoRow>(
      `SELECT ${pedidoColumns}
       FROM pedidos
       WHERE id = $1
         AND negocio_id = $2`,
      [id, negocioId]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapPedido(result.rows[0]);
  }

  async buscarPorCliente(negocioId: string, telefonoCliente: string): Promise<Pedido[]> {
    const result = await pool.query<PedidoRow>(
      `SELECT ${pedidoColumns}
       FROM pedidos
       WHERE negocio_id = $1
         AND telefono_cliente = $2
       ORDER BY creado_en DESC`,
      [negocioId, telefonoCliente]
    );

    return result.rows.map(mapPedido);
  }

  async buscarPorConversacion(negocioId: string, conversacionId: string): Promise<Pedido[]> {
    const result = await pool.query<PedidoRow>(
      `SELECT ${pedidoColumns}
       FROM pedidos
       WHERE negocio_id = $1
         AND conversacion_id = $2
       ORDER BY creado_en DESC`,
      [negocioId, conversacionId]
    );

    return result.rows.map(mapPedido);
  }

  async buscarPorEstado(negocioId: string, estado: EstadoPedido): Promise<Pedido[]> {
    const result = await pool.query<PedidoRow>(
      `SELECT ${pedidoColumns}
       FROM pedidos
       WHERE negocio_id = $1
         AND estado = $2
       ORDER BY creado_en DESC`,
      [negocioId, estado]
    );

    return result.rows.map(mapPedido);
  }

  async actualizar(id: string, negocioId: string, data: ActualizarPedidoDTO): Promise<Pedido | null> {
    const result = await pool.query<PedidoRow>(
      `UPDATE pedidos
       SET nombre_cliente = COALESCE($3, nombre_cliente),
           telefono_cliente = COALESCE($4, telefono_cliente),
           tipo_entrega = COALESCE($5, tipo_entrega),
           direccion_entrega = CASE WHEN $6 THEN $7 ELSE direccion_entrega END,
           metodo_pago = COALESCE($8, metodo_pago),
           costo_domicilio = COALESCE($9, costo_domicilio),
           total = COALESCE($10, total),
           estado = COALESCE($11, estado),
           notas = CASE WHEN $12 THEN $13 ELSE notas END
       WHERE id = $1
         AND negocio_id = $2
       RETURNING ${pedidoColumns}`,
      [
        id,
        negocioId,
        data.nombreCliente ?? null,
        data.telefonoCliente ?? null,
        data.tipoEntrega ?? null,
        Object.prototype.hasOwnProperty.call(data, 'direccionEntrega'),
        data.direccionEntrega ?? null,
        data.metodoPago ?? null,
        data.costoDomicilio ?? null,
        data.total ?? null,
        data.estado ?? null,
        Object.prototype.hasOwnProperty.call(data, 'notas'),
        data.notas ?? null,
      ]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapPedido(result.rows[0]);
  }

  async cambiarEstado(id: string, negocioId: string, estado: EstadoPedido): Promise<Pedido | null> {
    const result = await pool.query<PedidoRow>(
      `UPDATE pedidos
       SET estado = $3
       WHERE id = $1
         AND negocio_id = $2
       RETURNING ${pedidoColumns}`,
      [id, negocioId, estado]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapPedido(result.rows[0]);
  }

  async cancelarYCrearCompleto(
    pedidoAnteriorId: string,
    data: CrearPedidoCompletoDTO
  ): Promise<PedidoCompleto> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const cancelarResult = await client.query<PedidoRow>(
        `UPDATE pedidos
       SET estado = 'cancelado'
       WHERE id = $1
         AND negocio_id = $2
         AND estado IN ('pendiente', 'confirmado')
       RETURNING ${pedidoColumns}`,
        [pedidoAnteriorId, data.pedido.negocioId]
      );

      if (cancelarResult.rows.length === 0) {
        throw new Error(
          'Pedido no encontrado o no se puede modificar porque ya está en proceso.'
        );
      }

      const pedidoResult = await client.query<PedidoRow>(
        `INSERT INTO pedidos (
         negocio_id,
         cliente_id,
         conversacion_id,
         nombre_cliente,
         telefono_cliente,
         tipo_entrega,
         direccion_entrega,
         metodo_pago,
         costo_domicilio,
         total,
         notas,
         estado
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pendiente')
       RETURNING ${pedidoColumns}`,
        [
          data.pedido.negocioId,
          data.pedido.clienteId,
          data.pedido.conversacionId,
          data.pedido.nombreCliente,
          data.pedido.telefonoCliente,
          data.pedido.tipoEntrega,
          data.pedido.direccionEntrega,
          data.pedido.metodoPago,
          data.pedido.costoDomicilio,
          data.pedido.total,
          data.pedido.notas,
        ]
      );

      const pedido = mapPedido(pedidoResult.rows[0]);
      const productos: PedidoCompleto['productos'] = [];

      for (const item of data.productos) {
        const productoResult = await client.query<PedidoProductoRow>(
          `INSERT INTO pedidos_productos (
           negocio_id,
           pedidos_id,
           productos_id,
           nombre_producto,
           cantidad,
           precio_unitario,
           subtotal,
           notas
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING ${pedidoProductoColumns}`,
          [
            pedido.negocioId,
            pedido.id,
            item.productoId,
            item.nombreProducto,
            item.cantidad,
            item.precioUnitario,
            item.subtotal,
            item.notas ?? null,
          ]
        );

        const producto = mapPedidoProducto(productoResult.rows[0]);
        const extras: PedidoProductoExtra[] = [];

        for (const extra of item.extras) {
          const extraResult = await client.query<PedidoProductoExtraRow>(
            `INSERT INTO pedidos_productos_extras (
             pedido_producto_id,
             extra_id,
             negocio_id,
             nombre_extra,
             cantidad,
             precio_unitario,
             subtotal
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING ${pedidoProductoExtraColumns}`,
            [
              producto.id,
              extra.extraId,
              pedido.negocioId,
              extra.nombreExtra,
              extra.cantidad,
              extra.precioUnitario,
              extra.subtotal,
            ]
          );

          extras.push(mapPedidoProductoExtra(extraResult.rows[0]));
        }

        productos.push({ producto, extras });
      }

      await client.query('COMMIT');

      return { pedido, productos };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
