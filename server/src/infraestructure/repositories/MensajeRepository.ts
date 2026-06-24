import pool from '../../config/db';
import { Mensaje, CrearMensajeDTO } from '../../domain/entities/Mensaje';
import { IMensajeRepository } from '../../domain/repositories/IMensajeRepository';

interface MensajeRow {
  id: string;
  conversacion_id: string;
  rol: Mensaje['rol'];
  contenido: string;
  wamid: string;
  enviado_en: Date;
}

function mapMensaje(row: MensajeRow): Mensaje {
  return {
    id: row.id,
    conversacionId: row.conversacion_id,
    rol: row.rol,
    contenido: row.contenido,
    wamid: row.wamid,
    enviadoEn: row.enviado_en,
  };
}

export class MensajeRepository implements IMensajeRepository {
  async crear(data: CrearMensajeDTO, negocioId: string): Promise<Mensaje> {
    const result = await pool.query<MensajeRow>(
      `INSERT INTO mensajes (conversacion_id, rol, contenido, wamid, negocio_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, conversacion_id, rol, contenido, wamid, enviado_en`,
      [data.conversacionId, data.rol, data.contenido, data.wamid, negocioId]
    );

    return mapMensaje(result.rows[0]);
  }

  async buscarPorConversacion(conversacionId: string, negocioId:string): Promise<Mensaje[]> {
    const result = await pool.query<MensajeRow>(
      `SELECT id, conversacion_id, rol, contenido, wamid, enviado_en
       FROM mensajes
       WHERE conversacion_id = $1
       AND negocio_id = $2
       ORDER BY enviado_en ASC`,
      [conversacionId, negocioId]
    );

    return result.rows.map(mapMensaje);
  }

  async buscarUltimoMensajeCliente(conversacionId: string, negocioId:string): Promise<Mensaje | null> {
    const result = await pool.query<MensajeRow>(
      `SELECT id, conversacion_id, rol, contenido, wamid, enviado_en
       FROM mensajes
       WHERE conversacion_id = $1
         AND rol = 'cliente'
         AND negocio_id = $2
       ORDER BY enviado_en DESC
       LIMIT 1`,
      [conversacionId, negocioId]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapMensaje(result.rows[0]);
  }
}
