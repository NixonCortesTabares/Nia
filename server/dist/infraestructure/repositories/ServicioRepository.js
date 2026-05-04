"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicioRepository = void 0;
const db_1 = __importDefault(require("../../config/db"));
function mapServicio(row) {
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
class ServicioRepository {
    async crear(data) {
        const result = await db_1.default.query(`INSERT INTO servicios_catalogo (negocio_id, nombre, descripcion, duracion_minutos, precio_base)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, negocio_id, nombre, descripcion, duracion_minutos, precio_base, activo, creado_en`, [
            data.negocioId,
            data.nombre,
            data.descripcion ?? null,
            data.duracionMinutos,
            data.precioBase,
        ]);
        return mapServicio(result.rows[0]);
    }
    async buscarPorNegocio(negocioId) {
        const result = await db_1.default.query(`SELECT id, negocio_id, nombre, descripcion, duracion_minutos, precio_base, activo, creado_en
       FROM servicios_catalogo
       WHERE negocio_id = $1
       ORDER BY creado_en DESC`, [negocioId]);
        return result.rows.map(mapServicio);
    }
    async buscarPorId(id) {
        const result = await db_1.default.query(`SELECT id, negocio_id, nombre, descripcion, duracion_minutos, precio_base, activo, creado_en
       FROM servicios_catalogo
       WHERE id = $1`, [id]);
        if (!result.rows[0]) {
            return null;
        }
        return mapServicio(result.rows[0]);
    }
    async actualizar(id, data) {
        const result = await db_1.default.query(`UPDATE servicios_catalogo
       SET nombre = COALESCE($2, nombre),
           descripcion = COALESCE($3, descripcion),
           duracion_minutos = COALESCE($4, duracion_minutos),
           precio_base = COALESCE($5, precio_base)
       WHERE id = $1
       RETURNING id, negocio_id, nombre, descripcion, duracion_minutos, precio_base, activo, creado_en`, [
            id,
            data.nombre ?? null,
            data.descripcion ?? null,
            data.duracionMinutos ?? null,
            data.precioBase ?? null,
        ]);
        if (!result.rows[0]) {
            throw new Error('Servicio no encontrado');
        }
        return mapServicio(result.rows[0]);
    }
    async desactivar(id) {
        const result = await db_1.default.query(`UPDATE servicios_catalogo
       SET activo = false
       WHERE id = $1
       RETURNING id, negocio_id, nombre, descripcion, duracion_minutos, precio_base, activo, creado_en`, [id]);
        if (!result.rows[0]) {
            return null;
        }
        return mapServicio(result.rows[0]);
    }
}
exports.ServicioRepository = ServicioRepository;
