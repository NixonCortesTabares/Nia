import pool from '../../config/db';
import { Mensaje, CrearMensajeDTO } from '../../domain/entities/Mensaje';
import { IMensajeRepository } from '../../domain/repositories/IMensajeRepository';

interface MensajeRow {
  id: string;
  negocio_id: string;
  conversacion_id: string;
  rol: Mensaje['rol'];
  contenido: string;
  wamid: string;
  tipo: Mensaje['tipo'];
  media_id: string | null;
  media_url: string | null;
  mime_type: string | null;
  caption: string | null;
  enviado_en: Date;
}

function mapMensaje(row: MensajeRow): Mensaje {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    conversacionId: row.conversacion_id,
    rol: row.rol,
    contenido: row.contenido,
    wamid: row.wamid,
    tipo: row.tipo ?? 'texto',
    mediaId: row.media_id,
    mediaUrl: row.media_url,
    mimeType: row.mime_type,
    caption: row.caption,
    enviadoEn: row.enviado_en,
  };
}

export class MensajeRepository implements IMensajeRepository {
  async crear(data: CrearMensajeDTO, negocioId: string): Promise<Mensaje> {
    const result = await pool.query<MensajeRow>(
      `INSERT INTO mensajes (
         conversacion_id, rol, contenido, wamid, negocio_id,
         tipo, media_id, media_url, mime_type, caption
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, negocio_id, conversacion_id, rol, contenido, wamid,
                 tipo, media_id, media_url, mime_type, caption, enviado_en`,
      [
        data.conversacionId,
        data.rol,
        data.contenido,
        data.wamid,
        negocioId,
        data.tipo ?? 'texto',
        data.mediaId ?? null,
        data.mediaUrl ?? null,
        data.mimeType ?? null,
        data.caption ?? null,
      ]
    );

    return mapMensaje(result.rows[0]);
  }

  async buscarPorConversacion(conversacionId: string, negocioId:string): Promise<Mensaje[]> {
    const result = await pool.query<MensajeRow>(
      `SELECT id, negocio_id, conversacion_id, rol, contenido, wamid,
              tipo, media_id, media_url, mime_type, caption, enviado_en
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
      `SELECT id, negocio_id, conversacion_id, rol, contenido, wamid,
              tipo, media_id, media_url, mime_type, caption, enviado_en
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
