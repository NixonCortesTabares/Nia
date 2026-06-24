import pool from '../../config/db';
import { IConversacionRepository } from '../../domain/repositories/IConversacionRepository';

export interface ConversacionResumen {
  id: string;
  estado: string;
  cliente: {
    nombre: string | null;
    telefono: string | null;
  };
  ultimoMensaje: string | null;
  ultimaActividadEn: Date | null;
  creadoEn: Date;
}

interface ConversacionResumenRow {
  id: string;
  estado: string;
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  ultimo_mensaje: string | null;
  ultima_actividad_en: Date | null;
  creado_en: Date;
}

export class ListarConversacionesUseCase {
  constructor(
    private conversacionRepository: IConversacionRepository
  ) {}

  async execute(negocioId: string): Promise<ConversacionResumen[]> {
    const result = await pool.query<ConversacionResumenRow>(
      `SELECT
         c.id,
         c.estado,
         cl.nombre AS cliente_nombre,
         cl.telefono AS cliente_telefono,
         ultimo.contenido AS ultimo_mensaje,
         COALESCE(c.ultimo_mensaje_en, ultimo.enviado_en, c.iniciada_en) AS ultima_actividad_en,
         c.iniciada_en AS creado_en
       FROM conversaciones c
       INNER JOIN clientes cl
         ON cl.id = c.cliente_id
        AND cl.negocio_id = c.negocio_id
       LEFT JOIN LATERAL (
         SELECT m.contenido, m.enviado_en
         FROM mensajes m
         WHERE m.conversacion_id = c.id
           AND m.negocio_id = c.negocio_id
         ORDER BY m.enviado_en DESC
         LIMIT 1
       ) ultimo ON true
       WHERE c.negocio_id = $1
       ORDER BY COALESCE(c.ultimo_mensaje_en, ultimo.enviado_en, c.iniciada_en) DESC`,
      [negocioId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      estado: row.estado,
      cliente: {
        nombre: row.cliente_nombre,
        telefono: row.cliente_telefono,
      },
      ultimoMensaje: row.ultimo_mensaje,
      ultimaActividadEn: row.ultima_actividad_en,
      creadoEn: row.creado_en,
    }));
  }
}
