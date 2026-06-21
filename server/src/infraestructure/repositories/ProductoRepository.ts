import pool from '../../config/db';
import { ActualizarProductoDTO, CrearProductoDTO, Producto } from '../../domain/entities/Producto';
import { IProductoRepository } from '../../domain/repositories/IProductoRepository';

interface ProductoRow {
  id: string;
  negocio_id: string;
  categoria_id: string;
  nombre: string;
  ingredientes: string;
  descripcion: string;
  valor: number;
  activo: boolean;
}
export interface MenuProductoRow {
  categoriaNombre: string;
  productoNombre: string;
}

function mapProducto(row: ProductoRow): Producto {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    categoriaId: row.categoria_id,
    nombre: row.nombre,
    ingredientes: row.ingredientes,
    descripcion: row.descripcion,
    valor: row.valor,
    activo: row.activo,
  };
}

export class ProductoRepository implements IProductoRepository {
  async crear(data: CrearProductoDTO): Promise<Producto> {
    const result = await pool.query<ProductoRow>(
      `INSERT INTO productos (negocio_id, categoria_id, nombre, ingredientes, descripcion, valor)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, negocio_id, categoria_id, nombre, ingredientes, descripcion, valor, activo`,
      [
        data.negocioId,
        data.categoriaId,
        data.nombre,
        data.ingredientes,
        data.descripcion,
        data.valor,
      ]
    );

    return mapProducto(result.rows[0]);
  }

  async buscarPorNegocio(negocioId: string): Promise<Producto[]> {
    const result = await pool.query<ProductoRow>(
      `SELECT id, negocio_id, categoria_id, nombre, ingredientes, descripcion, valor, activo
       FROM productos
       WHERE negocio_id = $1
       ORDER BY nombre ASC`,
      [negocioId]
    );

    return result.rows.map(mapProducto);
  }

 async buscarMenuActivoPorNegocio(
  negocioId: string
): Promise<MenuProductoRow[]> {
  const result = await pool.query<{
    categoria_nombre: string;
    producto_nombre: string;
  }>(
    `
    SELECT
      c.nombre AS categoria_nombre,
      p.nombre AS producto_nombre
    FROM productos p
    INNER JOIN categorias c
      ON c.id = p.categoria_id
     AND c.negocio_id = p.negocio_id
    WHERE p.negocio_id = $1
      AND p.activo = true
      AND c.activo = true
    ORDER BY
      c.nombre ASC,
      p.nombre ASC
    `,
    [negocioId]
  );

  return result.rows.map((row) => ({
    categoriaNombre: row.categoria_nombre,
    productoNombre: row.producto_nombre,
  }));
}

  async buscarActivosPorNegocio(negocioId: string):Promise<Producto[]>{
    const result = await pool.query<ProductoRow>(
      `SELECT id, negocio_id, categoria_id, nombre, ingredientes, descripcion, valor, activo
       FROM productos
       WHERE negocio_id = $1
         AND activo = true
       ORDER BY nombre ASC`,
      [negocioId]
    );

    return result.rows.map(mapProducto);
  }

  async buscarDisponiblesPorNegocio(negocioId: string): Promise<Producto[]> {
    return this.buscarActivosPorNegocio(negocioId);
  }

  async buscarPorCategoria(negocioId: string, categoriaId: string): Promise<Producto[]> {
    const result = await pool.query<ProductoRow>(
      `SELECT id, negocio_id, categoria_id, nombre, ingredientes, descripcion, valor, activo
       FROM productos
       WHERE negocio_id = $1
         AND categoria_id = $2
       ORDER BY nombre ASC`,
      [negocioId, categoriaId]
    );

    return result.rows.map(mapProducto);
  }

  async buscarPorId(id: string, negocioId: string): Promise<Producto | null> {
    const result = await pool.query<ProductoRow>(
      `SELECT id, negocio_id, categoria_id, nombre, ingredientes, descripcion, valor, activo
       FROM productos
       WHERE id = $1
         AND negocio_id = $2`,
      [id, negocioId]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapProducto(result.rows[0]);
  }

  async buscarPorNombre(negocioId: string, nombre: string): Promise<Producto | null> {
    const result = await pool.query<ProductoRow>(
      `SELECT *
            FROM productos
            WHERE negocio_id = $1
              AND unaccent(LOWER(nombre)) = unaccent(LOWER($2))
              AND activo = true;`,
      [negocioId, nombre]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapProducto(result.rows[0]);
  }

  async actualizar(
    id: string,
    negocioId: string,
    data: ActualizarProductoDTO
  ): Promise<Producto | null> {
    const result = await pool.query<ProductoRow>(
      `UPDATE productos
       SET categoria_id = COALESCE($3, categoria_id),
           nombre = COALESCE($4, nombre),
           ingredientes = COALESCE($5, ingredientes),
           descripcion = COALESCE($6, descripcion),
           valor = COALESCE($7, valor),
           activo = COALESCE($8, activo)
       WHERE id = $1
         AND negocio_id = $2
       RETURNING id, negocio_id, categoria_id, nombre, ingredientes, descripcion, valor, activo`,
      [
        id,
        negocioId,
        data.categoriaId ?? null,
        data.nombre ?? null,
        data.ingredientes ?? null,
        data.descripcion ?? null,
        data.valor ?? null,
        data.activo ?? null,
      ]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapProducto(result.rows[0]);
  }

  async desactivar(id: string, negocioId: string): Promise<Producto | null> {
    const result = await pool.query<ProductoRow>(
      `UPDATE productos
       SET activo = false
       WHERE id = $1
         AND negocio_id = $2
       RETURNING id, negocio_id, categoria_id, nombre, ingredientes, descripcion, valor, activo`,
      [id, negocioId]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapProducto(result.rows[0]);
  }
}
