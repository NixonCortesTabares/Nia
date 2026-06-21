// server/src/infraestructure/repositories/MenuPublicoRepository.ts

import pool from '../../config/db';
import { Menu } from '../../domain/entities/Menu';
import {
  IMenuPublicoRepository} from '../../domain/repositories/IMenuRepository';

export class MenuPublicoRepository implements IMenuPublicoRepository {
  async obtenerPorSlug(link: string): Promise<Menu | null> {
    try {
      const negocioResult = await pool.query<{
        id: string;
        nombre: string;
      }>(
        `
        SELECT
          id,
          nombre
        FROM negocios
        WHERE menu_link = $1
          AND activo = true
        LIMIT 1
        `,
        [link]
      );

      if (negocioResult.rows.length === 0) {
        return null;
      }

      const negocio = negocioResult.rows[0];

      const categoriasResult = await pool.query<{
        categoria_id: string;
        categoria_nombre: string;
      }>(
        `
        SELECT
          id AS categoria_id,
          nombre AS categoria_nombre
        FROM categorias
        WHERE negocio_id = $1
          AND activo = true
        ORDER BY nombre ASC
        `,
        [negocio.id]
      );

      const productosResult = await pool.query<{
        categoria_id: string;
        nombre: string;
        ingredientes: string | null;
        descripcion: string | null;
        valor: string;
      }>(
        `
        SELECT
          categoria_id,
          nombre,
          ingredientes,
          descripcion,
          valor
        FROM productos
        WHERE negocio_id = $1
          AND activo = true
        ORDER BY nombre ASC
        `,
        [negocio.id]
      );

      const extrasResult = await pool.query<{
        categoria_id: string;
        nombre: string;
        valor: string;
      }>(
        `
        SELECT
          ce.categoria_id,
          e.nombre,
          e.valor
        FROM categorias_extras ce
        INNER JOIN extras e
          ON e.id = ce.extra_id
         AND e.negocio_id = ce.negocio_id
        WHERE ce.negocio_id = $1
          AND ce.activo = true
          AND e.activo = true
        ORDER BY e.nombre ASC
        `,
        [negocio.id]
      );

      const categorias = categoriasResult.rows.map((categoria) => {
        const productos = productosResult.rows
          .filter((producto) => producto.categoria_id === categoria.categoria_id)
          .map((producto) => ({
            nombre: producto.nombre,
            ingredientes: producto.ingredientes,
            descripcion: producto.descripcion,
            valor: Number(producto.valor),
          }));

        const extras = extrasResult.rows
          .filter((extra) => extra.categoria_id === categoria.categoria_id)
          .map((extra) => ({
            nombre: extra.nombre,
            valor: Number(extra.valor),
          }));

        return {
          nombre: categoria.categoria_nombre,
          productos,
          extras,
        };
      });

      return {
        negocio: {
          nombre: negocio.nombre,
        },
        categorias,
      };
    } catch (error) {
      console.error('Error DB obteniendo menú público:', error);
      throw new Error('Error interno del servidor.');
    }
  }
}