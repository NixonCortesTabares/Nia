"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfesionalRepository = void 0;
const db_1 = __importDefault(require("../../config/db"));
function mapProfesional(row) {
    return {
        id: row.id,
        negocioId: row.negocio_id,
        nombre: row.nombre,
        especialidad: row.especialidad ?? undefined,
        activo: row.activo,
        creadoEn: row.creado_en,
    };
}
class ProfesionalRepository {
    async crear(data) {
        const result = await db_1.default.query(`INSERT INTO profesionales (negocio_id, nombre, especialidad)
       VALUES ($1, $2, $3)
       RETURNING id, negocio_id, nombre, especialidad, activo, creado_en`, [data.negocioId, data.nombre, data.especialidad ?? null]);
        return mapProfesional(result.rows[0]);
    }
    async buscarPorNegocio(negocioId) {
        const result = await db_1.default.query(`SELECT id, negocio_id, nombre, especialidad, activo, creado_en
       FROM profesionales
       WHERE negocio_id = $1
       ORDER BY creado_en DESC`, [negocioId]);
        return result.rows.map(mapProfesional);
    }
    async buscarPorId(id) {
        const result = await db_1.default.query(`SELECT id, negocio_id, nombre, especialidad, activo, creado_en
       FROM profesionales
       WHERE id = $1`, [id]);
        if (!result.rows[0]) {
            return null;
        }
        return mapProfesional(result.rows[0]);
    }
    async actualizar(id, data) {
        const result = await db_1.default.query(`UPDATE profesionales
       SET nombre = COALESCE($2, nombre),
           especialidad = COALESCE($3, especialidad)
       WHERE id = $1
       RETURNING id, negocio_id, nombre, especialidad, activo, creado_en`, [id, data.nombre ?? null, data.especialidad ?? null]);
        if (!result.rows[0]) {
            return null;
        }
        return mapProfesional(result.rows[0]);
    }
    async desactivar(id) {
        const result = await db_1.default.query(`UPDATE profesionales
       SET activo = false
       WHERE id = $1
       RETURNING id, negocio_id, nombre, especialidad, activo, creado_en`, [id]);
        if (!result.rows[0]) {
            return null;
        }
        return mapProfesional(result.rows[0]);
    }
}
exports.ProfesionalRepository = ProfesionalRepository;
