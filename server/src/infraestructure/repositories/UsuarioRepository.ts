import pool from '../../config/db';
import { Usuario, CrearUsuarioDTO } from '../../domain/entities/Usuario';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepositoriy';

interface UsuarioRow {
  id: string;
  negocio_id: string;
  nombre: string;
  email: string;
  password_hash: string;
  rol: Usuario['rol'];
  activo: boolean;
  creado_en: Date;
}

function mapUsuario(row: UsuarioRow): Usuario {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    nombre: row.nombre,
    email: row.email,
    passwordHash: row.password_hash,
    rol: row.rol,
    activo: row.activo,
    creadoEn: row.creado_en,
  };
}

export class UsuarioRepository implements IUsuarioRepository {
  async crear(data: CrearUsuarioDTO): Promise<Usuario> {
    const result = await pool.query<UsuarioRow>(
      `INSERT INTO usuarios (negocio_id, nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, negocio_id, nombre, email, password_hash, rol, activo, creado_en`,
      [
        data.negocioId,
        data.nombre,
        data.email,
        data.passwordHash,
        data.rol ?? 'staff',
      ]
    );

    return mapUsuario(result.rows[0]);
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const result = await pool.query<UsuarioRow>(
      `SELECT id, negocio_id, nombre, email, password_hash, rol, activo, creado_en
       FROM usuarios
       WHERE email = $1`,
      [email]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapUsuario(result.rows[0]);
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const result = await pool.query<UsuarioRow>(
      `SELECT id, negocio_id, nombre, email, password_hash, rol, activo, creado_en
       FROM usuarios
       WHERE id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapUsuario(result.rows[0]);
  }
}
