import pool from '../../config/db';
import {
  Conversacion,
  CrearConversacionDTO,
  ActualizarConversacionDTO,
} from '../../domain/entities/Conversacion';
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
  };
}

export class ConversacionRepository implements IConversacionRepository {
  async buscarActivaYEscalada(clienteId: string, negocioId: string): Promise<Conversacion | null> {
    const result = await pool.query<ConversacionRow>(
      `SELECT id, negocio_id, cliente_id, tipo, estado, resumen, iniciada_en, cerrada_en, ultimo_mensaje_en
       FROM conversaciones 
       WHERE estado IN ('activa', 'escalada')
       AND cliente_id = $1
       AND negocio_id = $2
       AND ultimo_mensaje_en > NOW() - INTERVAL '24 hours'`,
       [clienteId, negocioId]
    );

    if(!result.rows[0]){
      return null;
    }
    return mapConversacion(result.rows[0]);
  }
  async crear(data: CrearConversacionDTO): Promise<Conversacion> {
    const result = await pool.query<ConversacionRow>(
      `INSERT INTO conversaciones (negocio_id, cliente_id, tipo)
       VALUES ($1, $2, $3)
       RETURNING id, negocio_id, cliente_id, tipo, estado, resumen, iniciada_en, cerrada_en, ultimo_mensaje_en`,
      [data.negocioId, data.clienteId, data.tipo ?? null]
    );

    return mapConversacion(result.rows[0]);
  }

  async buscarPorId(id: string): Promise<Conversacion | null> {
    const result = await pool.query<ConversacionRow>(
      `SELECT id, negocio_id, cliente_id, tipo, estado, resumen, iniciada_en, cerrada_en, ultimo_mensaje_en
       FROM conversaciones
       WHERE id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapConversacion(result.rows[0]);
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
       RETURNING id, negocio_id, cliente_id, tipo, estado, resumen, iniciada_en, cerrada_en, ultimo_mensaje_en`,
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
