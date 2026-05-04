import pool from '../../config/db';
import { Visita, CrearVisitaDTO } from '../../domain/entities/Visita';
import { IVisitaRepository } from '../../domain/repositories/IVisitaRepository';

interface VisitaRow {
  id: string;
  negocio_id: string;
  cliente_id: string;
  cita_id: string | null;
  fecha: Date;
  hora: string;
  total_cobrado: string | null;
  registrado_por: string | null;
  creado_en: Date;
}

function mapVisita(row: VisitaRow): Visita {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    clienteId: row.cliente_id,
    citaId: row.cita_id ?? undefined,
    fecha: row.fecha,
    hora: row.hora,
    totalCobrado: row.total_cobrado === null ? undefined : Number(row.total_cobrado),
    registradoPor: row.registrado_por ?? undefined,
    creadoEn: row.creado_en,
  };
}

export class VisitaRepository implements IVisitaRepository {
  async crear(data: CrearVisitaDTO): Promise<Visita> {
    const result = await pool.query<VisitaRow>(
      `INSERT INTO visitas (negocio_id, cliente_id, cita_id, fecha, hora, total_cobrado, registrado_por)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), COALESCE($5, CURRENT_TIME), $6, $7)
       RETURNING id, negocio_id, cliente_id, cita_id, fecha, hora, total_cobrado, registrado_por, creado_en`,
      [
        data.negocioId,
        data.clienteId,
        data.citaId ?? null,
        data.fecha ?? null,
        data.hora ?? null,
        data.totalCobrado ?? null,
        data.registradoPor ?? null,
      ]
    );

    return mapVisita(result.rows[0]);
  }

  async buscarPorId(id: string): Promise<Visita | null> {
    const result = await pool.query<VisitaRow>(
      `SELECT id, negocio_id, cliente_id, cita_id, fecha, hora, total_cobrado, registrado_por, creado_en
       FROM visitas
       WHERE id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapVisita(result.rows[0]);
  }

  async buscarPorNegocio(negocioId: string): Promise<Visita[]> {
    const result = await pool.query<VisitaRow>(
      `SELECT id, negocio_id, cliente_id, cita_id, fecha, hora, total_cobrado, registrado_por, creado_en
       FROM visitas
       WHERE negocio_id = $1
       ORDER BY fecha DESC, hora DESC`,
      [negocioId]
    );

    return result.rows.map(mapVisita);
  }

  async buscarPorNegocioYPeriodo(negocioId: string, desde: Date, hasta: Date): Promise<Visita[]> {
    const result = await pool.query<VisitaRow>(
      `SELECT id, negocio_id, cliente_id, cita_id, fecha, hora, total_cobrado, registrado_por, creado_en
       FROM visitas
       WHERE negocio_id = $1
         AND fecha BETWEEN $2 AND $3
       ORDER BY fecha DESC`,
      [negocioId, desde, hasta]
    );

    return result.rows.map(mapVisita);
  }

  async buscarPorCliente(clienteId: string): Promise<Visita[]> {
    const result = await pool.query<VisitaRow>(
      `SELECT id, negocio_id, cliente_id, cita_id, fecha, hora, total_cobrado, registrado_por, creado_en
       FROM visitas
       WHERE cliente_id = $1
       ORDER BY fecha DESC, hora DESC`,
      [clienteId]
    );

    return result.rows.map(mapVisita);
  }
}
