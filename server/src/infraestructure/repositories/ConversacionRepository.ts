import pool from '../../config/db';
import {
  Conversacion,
  CrearConversacionDTO,
  ActualizarConversacionDTO,
  PedidoBorradorItem,
} from '../../domain/entities/Conversacion';
import { PedidoBorrador } from '../../domain/entities/Conversacion';
import { IConversacionRepository } from '../../domain/repositories/IConversacionRepository';

interface ConversacionRow {
  id: string;
  negocio_id: string;
  cliente_id: string;
  tipo: Conversacion['tipo'] | null;
  estado: Conversacion['estado'];
  resumen: string | null;
  iniciada_en: Date;
  cerrada_en: Date | null;
  ultimo_mensaje_en: Date;
  pedido_borrador: PedidoBorrador;
}

function mapConversacion(row: ConversacionRow): Conversacion {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    clienteId: row.cliente_id,
    tipo: row.tipo ?? undefined,
    estado: row.estado,
    resumen: row.resumen ?? undefined,
    iniciadaEn: row.iniciada_en,
    cerradaEn: row.cerrada_en ?? undefined,
    ultimoMensajeEn: row.ultimo_mensaje_en,
    pedidoBorrador: row.pedido_borrador,
  };
}

export class ConversacionRepository implements IConversacionRepository {

  async cerrarConversaciones(): Promise<void> {
    const result = await pool.query(`
    UPDATE conversaciones
    SET estado = 'resuelta'
    WHERE estado IN ('activa', 'escalada')
      AND ultimo_mensaje_en IS NOT NULL
      AND ultimo_mensaje_en < (NOW() AT TIME ZONE 'America/Bogota') - INTERVAL '2 hours';
  `);

    console.log(`Conversaciones cerradas automáticamente: ${result.rowCount}`);
  }

  async actualizarItemsPedidoBorrador(
    conversacionId: string,
    items: PedidoBorradorItem[]
  ): Promise<PedidoBorrador | null> {
    const result = await pool.query<{
      pedido_borrador: PedidoBorrador;
    }>(
      `
    UPDATE conversaciones
    SET pedido_borrador = jsonb_set(
      pedido_borrador,
      '{items}',
      $2::jsonb,
      true
    )
    WHERE id = $1
    RETURNING pedido_borrador
    `,
      [conversacionId, JSON.stringify(items)]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].pedido_borrador;
  }
  async obtenerPedidoBorrador(conversacionId: string): Promise<PedidoBorrador | null> {
    const result = await pool.query<{
      pedido_borrador: PedidoBorrador;
    }>(
      `
    SELECT pedido_borrador
    FROM conversaciones
    WHERE id = $1
    LIMIT 1
    `,
      [conversacionId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].pedido_borrador;
  }

  async actualizarPedidoBorrador(
    conversacionId: string,
    pedidoBorrador: PedidoBorrador
  ): Promise<Conversacion | null> {
    const result = await pool.query<ConversacionRow>(
      `UPDATE conversaciones
     SET pedido_borrador = $2,
         ultimo_mensaje_en = NOW()
     WHERE id = $1
     RETURNING id, negocio_id, cliente_id, tipo, estado, resumen, iniciada_en, cerrada_en, ultimo_mensaje_en, pedido_borrador`,
      [conversacionId, JSON.stringify(pedidoBorrador)]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapConversacion(result.rows[0]);
  }
  async buscarActivaYEscalada(clienteId: string, negocioId: string): Promise<Conversacion | null> {
    const result = await pool.query<ConversacionRow>(
      `SELECT id, negocio_id, cliente_id, tipo, estado, resumen, iniciada_en, cerrada_en, ultimo_mensaje_en, pedido_borrador
       FROM conversaciones 
       WHERE estado IN ('activa', 'escalada')
       AND cliente_id = $1
       AND negocio_id = $2
       AND ultimo_mensaje_en > NOW() - INTERVAL '24 hours'`,
      [clienteId, negocioId]
    );

    if (!result.rows[0]) {
      return null;
    }
    return mapConversacion(result.rows[0]);
  }
  async crear(data: CrearConversacionDTO): Promise<Conversacion> {
    const result = await pool.query<ConversacionRow>(
      `INSERT INTO conversaciones (negocio_id, cliente_id, tipo)
       VALUES ($1, $2, $3)
       RETURNING id, negocio_id, cliente_id, tipo, estado, resumen, iniciada_en, cerrada_en, ultimo_mensaje_en, pedido_borrador`,
      [data.negocioId, data.clienteId, data.tipo ?? null]
    );

    return mapConversacion(result.rows[0]);
  }

  async buscarPorId(id: string): Promise<Conversacion | null> {
    const result = await pool.query<ConversacionRow>(
      `SELECT id, negocio_id, cliente_id, tipo, estado, resumen, iniciada_en, cerrada_en, ultimo_mensaje_en, pedido_borrador
       FROM conversaciones
       WHERE id = $1
       LIMIT 1`,
      [id]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapConversacion(result.rows[0]);
  }

  async marcarRespuestaPendiente(conversacionId: string, delayMs: number): Promise<void> {
    await pool.query(
      `UPDATE conversaciones
       SET respuesta_pendiente = true,
           procesar_despues_de = NOW() + ($2 || ' milliseconds')::interval,
           ultimo_mensaje_en = NOW()
       WHERE id = $1`,
      [conversacionId, delayMs]
    );
  }

  async buscarPendientesParaAgente(limit = 10): Promise<Conversacion[]> {
    const result = await pool.query<ConversacionRow>(
      `SELECT id, negocio_id, cliente_id, tipo, estado, resumen, iniciada_en, cerrada_en, ultimo_mensaje_en, pedido_borrador
       FROM conversaciones
       WHERE respuesta_pendiente = true
         AND procesar_despues_de <= NOW()
         AND estado = 'activa'
       ORDER BY procesar_despues_de ASC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map(mapConversacion);
  }

  async limpiarRespuestaPendiente(conversacionId: string): Promise<void> {
    await pool.query(
      `UPDATE conversaciones
       SET respuesta_pendiente = false,
           procesar_despues_de = NULL
       WHERE id = $1`,
      [conversacionId]
    );
  }

  async marcarProcesadaHasta(
    conversacionId: string,
    ultimoClienteProcesadoEn: Date
  ): Promise<void> {
    await pool.query(
      `UPDATE conversaciones c
       SET ultimo_cliente_procesado_en = $2,
           respuesta_pendiente = EXISTS (
             SELECT 1
             FROM mensajes m
             WHERE m.conversacion_id = c.id
               AND m.rol = 'cliente'
               AND m.enviado_en > $2
           ),
           procesar_despues_de = CASE
             WHEN EXISTS (
               SELECT 1
               FROM mensajes m
               WHERE m.conversacion_id = c.id
                 AND m.rol = 'cliente'
                 AND m.enviado_en > $2
             )
             THEN NOW() + INTERVAL '2 seconds'
             ELSE NULL
           END
       WHERE c.id = $1`,
      [conversacionId, ultimoClienteProcesadoEn]
    );
  }

  async marcarProcesadaHastaMensaje(
    conversacionId: string,
    mensajeClienteId: string
  ): Promise<void> {
    const result = await pool.query<{
      id: string;
      respuesta_pendiente: boolean;
      procesar_despues_de: Date | null;
      ultimo_cliente_procesado_en: Date;
    }>(
      `WITH mensaje_procesado AS (
         SELECT enviado_en
         FROM mensajes
         WHERE id = $2
           AND conversacion_id = $1
           AND rol = 'cliente'
         LIMIT 1
       ),
       estado_pendiente AS (
         SELECT EXISTS (
           SELECT 1
           FROM mensajes m, mensaje_procesado mp
           WHERE m.conversacion_id = $1
             AND m.rol = 'cliente'
             AND m.enviado_en > mp.enviado_en
         ) AS hay_mensajes_nuevos
       )
       UPDATE conversaciones c
       SET
         ultimo_cliente_procesado_en = mp.enviado_en,
         respuesta_pendiente = ep.hay_mensajes_nuevos,
         procesar_despues_de = CASE
           WHEN ep.hay_mensajes_nuevos
           THEN NOW() + INTERVAL '2 seconds'
           ELSE NULL
         END
       FROM mensaje_procesado mp, estado_pendiente ep
       WHERE c.id = $1
       RETURNING c.id, c.respuesta_pendiente, c.procesar_despues_de, c.ultimo_cliente_procesado_en`,
      [conversacionId, mensajeClienteId]
    );

    //console.log("Resultado marcarProcesadaHastaMensaje:",JSON.stringify(result.rows[0] ?? null));
  }

  async actualizar(id: string, data: ActualizarConversacionDTO): Promise<Conversacion | null> {
    const result = await pool.query<ConversacionRow>(
      `UPDATE conversaciones
       SET tipo = COALESCE($2, tipo),
           estado = COALESCE($3, estado),
           resumen = COALESCE($4, resumen),
           cerrada_en = COALESCE($5, cerrada_en),
           ultimo_mensaje_en = COALESCE($6, ultimo_mensaje_en)
       WHERE id = $1
       RETURNING id, negocio_id, cliente_id, tipo, estado, resumen, iniciada_en, cerrada_en, ultimo_mensaje_en, pedido_borrador`,
      [
        id,
        data.tipo ?? null,
        data.estado ?? null,
        data.resumen ?? null,
        data.cerradaEn ?? null,
        data.ultimoMensajeEn ?? null,
      ]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapConversacion(result.rows[0]);
  }
}
