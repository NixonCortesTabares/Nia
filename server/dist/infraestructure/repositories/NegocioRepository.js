"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NegocioRepository = void 0;
const db_1 = __importDefault(require("../../config/db"));
function mapNegocio(row) {
    return {
        id: row.id,
        nombre: row.nombre,
        tipo: row.tipo,
        telefonoWs: row.telefono_ws ?? undefined,
        ciudad: row.ciudad ?? undefined,
        direccion: row.direccion ?? undefined,
        activo: row.activo,
        creadoEn: row.creado_en,
    };
}
class NegocioRepository {
    async buscarPorTelefonoWs(telefonoWs) {
        const result = await db_1.default.query(`SELECT id, nombre, tipo, telefono_ws, ciudad, direccion, activo, creado_en
       FROM negocios WHERE telefono_ws = $1;`, [telefonoWs]);
        if (!result.rows[0]) {
            return null;
        }
        return mapNegocio(result.rows[0]);
    }
    async crear(data) {
        const result = await db_1.default.query(`INSERT INTO negocios (nombre, tipo, ciudad, direccion)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, tipo, telefono_ws, ciudad, direccion, activo, creado_en`, [
            data.nombre,
            data.tipo,
            data.ciudad ?? null,
            data.direccion ?? null,
        ]);
        return mapNegocio(result.rows[0]);
    }
    async buscarPorId(id) {
        const result = await db_1.default.query(`SELECT id, nombre, tipo, telefono_ws, ciudad, direccion, activo, creado_en
       FROM negocios
       WHERE id = $1`, [id]);
        if (!result.rows[0]) {
            return null;
        }
        return mapNegocio(result.rows[0]);
    }
    async editar(id, data) {
        const result = await db_1.default.query(`UPDATE negocios
       SET nombre = COALESCE($2, nombre),
           tipo = COALESCE($3, tipo),
           telefono_ws = COALESCE($4, telefono_ws),
           ciudad = COALESCE($5, ciudad),
           direccion = COALESCE($6, direccion)
       WHERE id = $1
       RETURNING id, nombre, tipo, telefono_ws, ciudad, direccion, activo, creado_en`, [
            id,
            data.nombre ?? null,
            data.tipo ?? null,
            data.telefonoWs ?? null,
            data.ciudad ?? null,
            data.direccion ?? null,
        ]);
        if (!result.rows[0]) {
            return null;
        }
        return mapNegocio(result.rows[0]);
    }
    async desactivar(id) {
        const result = await db_1.default.query(`UPDATE negocios
       SET activo = false
       WHERE id = $1
       RETURNING id, nombre, tipo, telefono_ws, ciudad, direccion, activo, creado_en`, [id]);
        if (!result.rows[0]) {
            return null;
        }
        return mapNegocio(result.rows[0]);
    }
}
exports.NegocioRepository = NegocioRepository;
