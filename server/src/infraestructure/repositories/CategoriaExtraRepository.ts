import pool from '../../config/db';
import {
  ActualizarCategoriaExtraDTO,
  CategoriaExtra,
  CrearCategoriaExtraDTO,
} from '../../domain/entities/CategoriaExtra';
import { ICategoriaExtraRepository } from '../../domain/repositories/ICategoriaExtraRepository';

interface CategoriaExtraRow {
  id: string;
  negocio_id: string;
  categoria_id: string;
  extra_id: string;
  activo: boolean;
  creado_en: Date;
  actualizado_en: Date;
}

function mapCategoriaExtra(row: CategoriaExtraRow): CategoriaExtra {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    categoriaId: row.categoria_id,
    extraId: row.extra_id,
    activo: row.activo,
    creadoEn: row.creado_en,
    actualizadoEn: row.actualizado_en,
  };
}

export class CategoriaExtraRepository implements ICategoriaExtraRepository {
  async crear(data: CrearCategoriaExtraDTO): Promise<CategoriaExtra> {
    const result = await pool.query<CategoriaExtraRow>(
      `INSERT INTO categorias_extras (negocio_id, categoria_id, extra_id)
       VALUES ($1, $2, $3)
       RETURNING id, negocio_id, categoria_id, extra_id, activo, creado_en, actualizado_en`,
      [data.negocioId, data.categoriaId, data.extraId]
    );

    return mapCategoriaExtra(result.rows[0]);
  }

  async buscarPorCategoria(negocioId: string, categoriaId: string): Promise<CategoriaExtra[]> {
    const result = await pool.query<CategoriaExtraRow>(
      `SELECT id, negocio_id, categoria_id, extra_id, activo, creado_en, actualizado_en
       FROM categorias_extras
       WHERE negocio_id = $1
         AND categoria_id = $2
       ORDER BY creado_en DESC`,
      [negocioId, categoriaId]
    );

    return result.rows.map(mapCategoriaExtra);
  }

  async buscarPorExtra(negocioId: string, extraId: string): Promise<CategoriaExtra[]> {
    const result = await pool.query<CategoriaExtraRow>(
      `SELECT id, negocio_id, categoria_id, extra_id, activo, creado_en, actualizado_en
       FROM categorias_extras
       WHERE negocio_id = $1
         AND extra_id = $2
       ORDER BY creado_en DESC`,
      [negocioId, extraId]
    );

    return result.rows.map(mapCategoriaExtra);
  }

  async existeActiva(negocioId: string, categoriaId: string, extraId: string): Promise<boolean> {
    const result = await pool.query<{ existe: boolean }>(
      `SELECT EXISTS (
         SELECT 1
         FROM categorias_extras
         WHERE negocio_id = $1
           AND categoria_id = $2
           AND extra_id = $3
           AND activo = true
       ) AS existe`,
      [negocioId, categoriaId, extraId]
    );

    return result.rows[0]?.existe ?? false;
  }

  async actualizar(
    id: string,
    negocioId: string,
    data: ActualizarCategoriaExtraDTO
  ): Promise<CategoriaExtra | null> {
    const result = await pool.query<CategoriaExtraRow>(
      `UPDATE categorias_extras
       SET activo = COALESCE($3, activo),
           actualizado_en = NOW()
       WHERE id = $1
         AND negocio_id = $2
       RETURNING id, negocio_id, categoria_id, extra_id, activo, creado_en, actualizado_en`,
      [id, negocioId, data.activo ?? null]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapCategoriaExtra(result.rows[0]);
  }

  async desactivar(id: string, negocioId: string): Promise<CategoriaExtra | null> {
    const result = await pool.query<CategoriaExtraRow>(
      `UPDATE categorias_extras
       SET activo = false,
           actualizado_en = NOW()
       WHERE id = $1
         AND negocio_id = $2
       RETURNING id, negocio_id, categoria_id, extra_id, activo, creado_en, actualizado_en`,
      [id, negocioId]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapCategoriaExtra(result.rows[0]);
  }
}
