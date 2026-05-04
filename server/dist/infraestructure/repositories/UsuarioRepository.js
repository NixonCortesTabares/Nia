"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioRepository = void 0;
const db_1 = __importDefault(require("../../config/db"));
function mapUsuario(row) {
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
class UsuarioRepository {
    async crear(data) {
        const result = await db_1.default.query(`INSERT INTO usuarios (negocio_id, nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, negocio_id, nombre, email, password_hash, rol, activo, creado_en`, [
            data.negocioId,
            data.nombre,
            data.email,
            data.passwordHash,
            data.rol ?? 'staff',
        ]);
        return mapUsuario(result.rows[0]);
    }
    async buscarPorEmail(email) {
        const result = await db_1.default.query(`SELECT id, negocio_id, nombre, email, password_hash, rol, activo, creado_en
       FROM usuarios
       WHERE email = $1`, [email]);
        if (!result.rows[0]) {
            return null;
        }
        return mapUsuario(result.rows[0]);
    }
    async buscarPorId(id) {
        const result = await db_1.default.query(`SELECT id, negocio_id, nombre, email, password_hash, rol, activo, creado_en
       FROM usuarios
       WHERE id = $1`, [id]);
        if (!result.rows[0]) {
            return null;
        }
        return mapUsuario(result.rows[0]);
    }
}
exports.UsuarioRepository = UsuarioRepository;
