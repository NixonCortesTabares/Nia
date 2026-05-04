import pool from '../../config/db';
import { Servicio, CrearServicioDTO, EditarServicioDTO } from '../../domain/entities/Servicio';
import { IServicioRepository } from '../../domain/repositories/IServicioRepository';

interface ServicioRow {
  id: string;
  negocio_id: string;
  nombre: string;
  descripcion: string | null;
  duracion_minutos: number;
  precio_base: string;
  activo: boolean;
  creado_en: Date;
}

function mapServicio(row: ServicioRow): Servicio {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    nombre: row.nombre,
    descripcion: row.descripcion ?? undefined,
    duracionMinutos: row.duracion_minutos,
    precioBase: Number(row.precio_base),
    activo: row.activo,
    creadoEn: row.creado_en,
  };
}

export class ServicioRepository implements IServicioRepository {
  async crear(data: CrearServicioDTO): Promise<Servicio> {
    const result = await pool.query<ServicioRow>(
      `INSERT INTO servicios_catalogo (negocio_id, nombre, descripcion, duracion_minutos, precio_base)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, negocio_id, nombre, descripcion, duracion_minutos, precio_base, activo, creado_en`,
      [
        data.negocioId,
        data.nombre,
        data.descripcion ?? null,
        data.duracionMinutos,
        data.precioBase,
      ]
    );

    return mapServicio(result.rows[0]);
  }

  async buscarPorNegocio(negocioId: string): Promise<Servicio[]> {
    const result = await pool.query<ServicioRow>(
      `SELECT id, negocio_id, nombre, descripcion, duracion_minutos, precio_base, activo, creado_en
       FROM servicios_catalogo
       WHERE negocio_id = $1
       ORDER BY creado_en DESC`,
      [negocioId]
    );

    return result.rows.map(mapServicio);
  }

  async buscarPorId(id: string): Promise<Servicio | null> {
    const result = await pool.query<ServicioRow>(
      `SELECT id, negocio_id, nombre, descripcion, duracion_minutos, precio_base, activo, creado_en
       FROM servicios_catalogo
       WHERE id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapServicio(result.rows[0]);
  }

  async actualizar(id: string, data: EditarServicioDTO): Promise<Servicio> {
    const result = await pool.query<ServicioRow>(
      `UPDATE servicios_catalogo
       SET nombre = COALESCE($2, nombre),
           descripcion = COALESCE($3, descripcion),
           duracion_minutos = COALESCE($4, duracion_minutos),
           precio_base = COALESCE($5, precio_base)
       WHERE id = $1
       RETURNING id, negocio_id, nombre, descripcion, duracion_minutos, precio_base, activo, creado_en`,
      [
        id,
        data.nombre ?? null,
        data.descripcion ?? null,
        data.duracionMinutos ?? null,
        data.precioBase ?? null,
      ]
    );

    if (!result.rows[0]) {
      throw new Error('Servicio no encontrado');
    }

    return mapServicio(result.rows[0]);
  }

  async desactivar(id: string): Promise<Servicio | null> {
    const result = await pool.query<ServicioRow>(
      `UPDATE servicios_catalogo
       SET activo = false
       WHERE id = $1
       RETURNING id, negocio_id, nombre, descripcion, duracion_minutos, precio_base, activo, creado_en`,
      [id]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapServicio(result.rows[0]);
  }
}
