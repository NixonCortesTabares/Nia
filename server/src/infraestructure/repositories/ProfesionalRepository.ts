import pool from '../../config/db';
import { Profesional, CrearProfesionalDTO, ActualizarProfesionalDTO } from '../../domain/entities/Profesional';
import { IProfesionalRepository } from '../../domain/repositories/IProfesionalRepository';

interface ProfesionalRow {
  id: string;
  negocio_id: string;
  nombre: string;
  especialidad: string | null;
  activo: boolean;
  creado_en: Date;
}

function mapProfesional(row: ProfesionalRow): Profesional {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    nombre: row.nombre,
    especialidad: row.especialidad ?? undefined,
    activo: row.activo,
    creadoEn: row.creado_en,
  };
}

export class ProfesionalRepository implements IProfesionalRepository {
  async crear(data: CrearProfesionalDTO): Promise<Profesional> {
    const result = await pool.query<ProfesionalRow>(
      `INSERT INTO profesionales (negocio_id, nombre, especialidad)
       VALUES ($1, $2, $3)
       RETURNING id, negocio_id, nombre, especialidad, activo, creado_en`,
      [data.negocioId, data.nombre, data.especialidad ?? null]
    );

    return mapProfesional(result.rows[0]);
  }

  async buscarPorNegocio(negocioId: string): Promise<Profesional[]> {
    const result = await pool.query<ProfesionalRow>(
      `SELECT id, negocio_id, nombre, especialidad, activo, creado_en
       FROM profesionales
       WHERE negocio_id = $1
       ORDER BY creado_en DESC`,
      [negocioId]
    );

    return result.rows.map(mapProfesional);
  }

  async buscarPorId(id: string): Promise<Profesional | null> {
    const result = await pool.query<ProfesionalRow>(
      `SELECT id, negocio_id, nombre, especialidad, activo, creado_en
       FROM profesionales
       WHERE id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapProfesional(result.rows[0]);
  }

  async actualizar(id: string, data: ActualizarProfesionalDTO): Promise<Profesional | null> {
    const result = await pool.query<ProfesionalRow>(
      `UPDATE profesionales
       SET nombre = COALESCE($2, nombre),
           especialidad = COALESCE($3, especialidad)
       WHERE id = $1
       RETURNING id, negocio_id, nombre, especialidad, activo, creado_en`,
      [id, data.nombre ?? null, data.especialidad ?? null]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapProfesional(result.rows[0]);
  }

  async desactivar(id: string): Promise<Profesional | null> {
    const result = await pool.query<ProfesionalRow>(
      `UPDATE profesionales
       SET activo = false
       WHERE id = $1
       RETURNING id, negocio_id, nombre, especialidad, activo, creado_en`,
      [id]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapProfesional(result.rows[0]);
  }
}
