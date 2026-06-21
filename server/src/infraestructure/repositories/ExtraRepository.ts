import pool from '../../config/db';
import { ActualizarExtraDTO, CrearExtraDTO, Extra } from '../../domain/entities/Extra';
import { IExtraRepository } from '../../domain/repositories/IExtraRepository';

interface ExtraRow {
  id: string;
  negocio_id: string;
  nombre: string;
  valor: number;
  creado_en: Date;
  activo: boolean;
}

function mapExtra(row: ExtraRow): Extra {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    nombre: row.nombre,
    valor: row.valor,
    creadoEn: row.creado_en,
    activo: row.activo,
  };
}

export class ExtraRepository implements IExtraRepository {
  async buscarPorCategoriaId(categoriaId: string, negocioId: string): Promise<Extra[] | null> {
    const result = await pool.query<ExtraRow>(
        `SELECT e.* FROM extras e 
        INNER JOIN categorias_extras ce
        ON ce.extra_id = e.id
        WHERE ce.negocio_id = $1
        AND  ce.categoria_id = $2;`,[negocioId, categoriaId]
    );

     return result.rows.map(mapExtra);
  }
  async crear(data: CrearExtraDTO): Promise<Extra> {
    const result = await pool.query<ExtraRow>(
      `INSERT INTO extras (negocio_id, nombre, valor)
       VALUES ($1, $2, $3)
       RETURNING id, negocio_id, nombre, valor, creado_en, activo`,
      [data.negocioId, data.nombre, data.valor]
    );

    return mapExtra(result.rows[0]);
  }

  async buscarPorNegocio(negocioId: string): Promise<Extra[]> {
    const result = await pool.query<ExtraRow>(
      `SELECT id, negocio_id, nombre, valor, creado_en, activo
       FROM extras
       WHERE negocio_id = $1
       ORDER BY creado_en DESC`,
      [negocioId]
    );

    return result.rows.map(mapExtra);
  }

  async buscarActivosPorNegocio(negocioId: string): Promise<Extra[]> {
    const result = await pool.query<ExtraRow>(
      `SELECT id, negocio_id, nombre, valor, creado_en, activo
       FROM extras
       WHERE negocio_id = $1
         AND activo = true
       ORDER BY nombre ASC`,
      [negocioId]
    );

    return result.rows.map(mapExtra);
  }

  async buscarPorId(id: string, negocioId: string): Promise<Extra | null> {
    const result = await pool.query<ExtraRow>(
      `SELECT id, negocio_id, nombre, valor, creado_en, activo
       FROM extras
       WHERE id = $1
         AND negocio_id = $2`,
      [id, negocioId]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapExtra(result.rows[0]);
  }

  async buscarPorNombre(negocioId: string, nombre: string): Promise<Extra | null> {
    const result = await pool.query<ExtraRow>(
      `SELECT id, negocio_id, nombre, valor, creado_en, activo
       FROM extras
       WHERE negocio_id = $1
         AND LOWER(nombre) = LOWER($2)
       LIMIT 1`,
      [negocioId, nombre]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapExtra(result.rows[0]);
  }

  async actualizar(id: string, negocioId: string, data: ActualizarExtraDTO): Promise<Extra | null> {
    const result = await pool.query<ExtraRow>(
      `UPDATE extras
       SET nombre = COALESCE($3, nombre),
           valor = COALESCE($4, valor),
           activo = COALESCE($5, activo)
       WHERE id = $1
         AND negocio_id = $2
       RETURNING id, negocio_id, nombre, valor, creado_en, activo`,
      [id, negocioId, data.nombre ?? null, data.valor ?? null, data.activo ?? null]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapExtra(result.rows[0]);
  }

  async desactivar(id: string, negocioId: string): Promise<Extra | null> {
    const result = await pool.query<ExtraRow>(
      `UPDATE extras
       SET activo = false
       WHERE id = $1
         AND negocio_id = $2
       RETURNING id, negocio_id, nombre, valor, creado_en, activo`,
      [id, negocioId]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapExtra(result.rows[0]);
  }
}
