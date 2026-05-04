import pool from '../../config/db';
import { VisitaServicio, CrearVisitaServicioDTO } from '../../domain/entities/VisitaServicio';
import { IVisitaServicioRepository } from '../../domain/repositories/IVisitaServicioRepository';

interface VisitaServicioRow {
  id: string;
  visita_id: string;
  servicio_id: string;
  profesional_id: string | null;
  precio_cobrado: string;
  duracion_minutos: number;
  creado_en: Date;
}

function mapVisitaServicio(row: VisitaServicioRow): VisitaServicio {
  return {
    id: row.id,
    visitaId: row.visita_id,
    servicioId: row.servicio_id,
    profesionalId: row.profesional_id ?? undefined,
    precioCobrado: Number(row.precio_cobrado),
    duracionMinutos: row.duracion_minutos,
    creadoEn: row.creado_en,
  };
}

export class VisitaServicioRepository implements IVisitaServicioRepository {
  async crear(data: CrearVisitaServicioDTO): Promise<VisitaServicio> {
    const result = await pool.query<VisitaServicioRow>(
      `INSERT INTO visita_servicios (visita_id, servicio_id, profesional_id, precio_cobrado, duracion_minutos)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, visita_id, servicio_id, profesional_id, precio_cobrado, duracion_minutos, creado_en`,
      [
        data.visitaId,
        data.servicioId,
        data.profesionalId ?? null,
        data.precioCobrado,
        data.duracionMinutos,
      ]
    );

    return mapVisitaServicio(result.rows[0]);
  }

  async buscarPorVisita(visitaId: string): Promise<VisitaServicio[]> {
    const result = await pool.query<VisitaServicioRow>(
      `SELECT id, visita_id, servicio_id, profesional_id, precio_cobrado, duracion_minutos, creado_en
       FROM visita_servicios
       WHERE visita_id = $1
       ORDER BY creado_en ASC`,
      [visitaId]
    );

    return result.rows.map(mapVisitaServicio);
  }

  async buscarPorServicio(servicioId: string): Promise<VisitaServicio[]> {
    const result = await pool.query<VisitaServicioRow>(
      `SELECT id, visita_id, servicio_id, profesional_id, precio_cobrado, duracion_minutos, creado_en
       FROM visita_servicios
       WHERE servicio_id = $1
       ORDER BY creado_en DESC`,
      [servicioId]
    );

    return result.rows.map(mapVisitaServicio);
  }

  async buscarPorNegocioYPeriodo(
    negocioId: string,
    desde: Date,
    hasta: Date
  ): Promise<VisitaServicio[]> {
    const result = await pool.query<VisitaServicioRow>(
      `SELECT vs.id, vs.visita_id, vs.servicio_id, vs.profesional_id, vs.precio_cobrado, vs.duracion_minutos, vs.creado_en
       FROM visita_servicios vs
       INNER JOIN visitas v ON v.id = vs.visita_id
       WHERE v.negocio_id = $1
         AND v.fecha BETWEEN $2 AND $3`,
      [negocioId, desde, hasta]
    );

    return result.rows.map(mapVisitaServicio);
  }
}
