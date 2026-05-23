import pool from '../../config/db';
import { ActualizarCategoriaDTO, Categoria, CrearCategoriaDTO } from '../../domain/entities/Categoria';
import { ICategoriaRepository } from '../../domain/repositories/ICategoriaRepository';

interface CategoriaRow {
  id: string;
  negocio_id: string;
  nombre: string;
  activo: boolean;
  creado_en: Date;
}

function mapCategoria(row: CategoriaRow): Categoria {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    nombre: row.nombre,
    activo: row.activo,
    creadoEn: row.creado_en,
  };
}

export class CategoriaRepository implements ICategoriaRepository {
  async crear(data: CrearCategoriaDTO): Promise<Categoria> {
    const result = await pool.query<CategoriaRow>(
      `INSERT INTO categorias (negocio_id, nombre)
       VALUES ($1, $2)
       RETURNING id, negocio_id, nombre, activo, creado_en`,
      [data.negocioId, data.nombre]
    );

    return mapCategoria(result.rows[0]);
  }

  async buscarPorNegocio(negocioId: string): Promise<Categoria[]> {
    const result = await pool.query<CategoriaRow>(
      `SELECT id, negocio_id, nombre, activo, creado_en
       FROM categorias
       WHERE negocio_id = $1
       ORDER BY creado_en DESC`,
      [negocioId]
    );

    return result.rows.map(mapCategoria);
  }

  async buscarActivasPorNegocio(negocioId: string): Promise<Categoria[]> {
    const result = await pool.query<CategoriaRow>(
      `SELECT id, negocio_id, nombre, activo, creado_en
       FROM categorias
       WHERE negocio_id = $1
         AND activo = true
       ORDER BY nombre ASC`,
      [negocioId]
    );

    return result.rows.map(mapCategoria);
  }

  async buscarPorId(id: string, negocioId: string): Promise<Categoria | null> {
    const result = await pool.query<CategoriaRow>(
      `SELECT id, negocio_id, nombre, activo, creado_en
       FROM categorias
       WHERE id = $1
         AND negocio_id = $2`,
      [id, negocioId]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapCategoria(result.rows[0]);
  }

  async buscarPorNombre(negocioId: string, nombre: string): Promise<Categoria | null> {
    const result = await pool.query<CategoriaRow>(
      `SELECT id, negocio_id, nombre, activo, creado_en
       FROM categorias
       WHERE negocio_id = $1
         AND LOWER(nombre) = LOWER($2)
       LIMIT 1`,
      [negocioId, nombre]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapCategoria(result.rows[0]);
  }

  async actualizar(
    id: string,
    negocioId: string,
    data: ActualizarCategoriaDTO
  ): Promise<Categoria | null> {
    const result = await pool.query<CategoriaRow>(
      `UPDATE categorias
       SET nombre = COALESCE($3, nombre),
           activo = COALESCE($4, activo)
       WHERE id = $1
         AND negocio_id = $2
       RETURNING id, negocio_id, nombre, activo, creado_en`,
      [id, negocioId, data.nombre ?? null, data.activo ?? null]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapCategoria(result.rows[0]);
  }

  async desactivar(id: string, negocioId: string): Promise<Categoria | null> {
    const result = await pool.query<CategoriaRow>(
      `UPDATE categorias
       SET activo = false
       WHERE id = $1
         AND negocio_id = $2
       RETURNING id, negocio_id, nombre, activo, creado_en`,
      [id, negocioId]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapCategoria(result.rows[0]);
  }
}
