import pool from '../../config/db';
import { Negocio, CrearNegocioDTO, EditarNegocioDTO } from '../../domain/entities/Negocio';
import { INegocioRepository } from '../../domain/repositories/INegocioRepository';

interface NegocioRow {
  id: string;
  nombre: string;
  tipo: Negocio['tipo'];
  telefono_ws: string | null;
  ciudad: string | null;
  direccion: string | null;
  activo: boolean;
  creado_en: Date;
  menu_link:string;
  costo_domicilio: number;
  numtel: string;
  menupdf: string;
  menufoto: string;
  tipomenu: string;
}

function mapNegocio(row: NegocioRow): Negocio {
  return {
    id: row.id,
    nombre: row.nombre,
    tipo: row.tipo,
    telefonoWs: row.telefono_ws ?? undefined,
    ciudad: row.ciudad ?? undefined,
    direccion: row.direccion ?? undefined,
    activo: row.activo,
    creadoEn: row.creado_en,
    menu_link: row.menu_link,
    costo_domicilio: row.costo_domicilio,
    numtel: row.numtel,
    menupdf: row.menupdf,
    menufoto: row.menufoto,
    tipomenu: row.tipomenu
  };
}

export interface TiposMenu{
  menu_link: string;
  menupdf: string;
  menufoto: string;
  tipomenu: string;
}

export class NegocioRepository implements INegocioRepository {
  async getMenuRestaurante(wamid: string): Promise<TiposMenu | null> {
    const result = await pool.query<{menu_link: string, menupdf: string, menufoto: string, tipomenu: string}>(
      `SELECT menu_link, menupdf, menufoto, tipomenu FROM negocios WHERE telefono_ws = $1;`, [wamid]
    )

    if(!result.rows[0]){
      return null;
    }

    return result.rows[0];
  }
  async buscarPorTelefonoWs(telefonoWs: string): Promise<Negocio | null> {
    const result = await pool.query<NegocioRow>(
      `SELECT id, nombre, tipo, telefono_ws, ciudad, direccion, activo, creado_en, costo_domicilio, numtel, 
      menupdf, menufoto, tipomenu
       FROM negocios WHERE telefono_ws = $1;`,
      [telefonoWs]
    );

    if(!result.rows[0]){
      return null;
    }

    return mapNegocio(result.rows[0]);
  }
  async crear(data: CrearNegocioDTO): Promise<Negocio> {
    const result = await pool.query<NegocioRow>(
      `INSERT INTO negocios (nombre, tipo, ciudad, direccion)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, tipo, telefono_ws, ciudad, direccion, activo, creado_en, costo_domicilio, numtel,
       menupdf, menufoto, tipomenu`,
      [
        data.nombre,
        data.tipo,
        data.ciudad ?? null,
        data.direccion ?? null,
      ]
    );

    return mapNegocio(result.rows[0]);
  }

  async buscarPorId(id: string): Promise<Negocio | null> {
    const result = await pool.query<NegocioRow>(
      `SELECT id, nombre, tipo, telefono_ws, ciudad, direccion, activo, creado_en, menu_link, costo_domicilio, numtel,
      menupdf, menufoto, tipomenu
       FROM negocios
       WHERE id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapNegocio(result.rows[0]);
  }

  async editar(id: string, data: EditarNegocioDTO): Promise<Negocio | null> {
    const result = await pool.query<NegocioRow>(
      `UPDATE negocios
       SET nombre = COALESCE($2, nombre),
           tipo = COALESCE($3, tipo),
           telefono_ws = COALESCE($4, telefono_ws),
           ciudad = COALESCE($5, ciudad),
           direccion = COALESCE($6, direccion),
           costo_domicilio = COALESCE($7, costo_domicilio)
       WHERE id = $1
       RETURNING id, nombre, tipo, telefono_ws, ciudad, direccion, activo, creado_en, menu_link, costo_domicilio,
       menupdf, menufoto, tipomenu`,
      [
        id,
        data.nombre ?? null,
        data.tipo ?? null,
        data.telefonoWs ?? null,
        data.ciudad ?? null,
        data.direccion ?? null,
        data.costo_domicilio ?? null
      ]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapNegocio(result.rows[0]);
  }

  async desactivar(id: string): Promise<Negocio | null> {
    const result = await pool.query<NegocioRow>(
      `UPDATE negocios
       SET activo = false
       WHERE id = $1
       RETURNING id, nombre, tipo, telefono_ws, ciudad, direccion, activo, creado_en`,
      [id]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapNegocio(result.rows[0]);
  }
}
