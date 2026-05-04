"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitaRepository = void 0;
const db_1 = __importDefault(require("../../config/db"));
function mapVisita(row) {
    return {
        id: row.id,
        negocioId: row.negocio_id,
        clienteId: row.cliente_id,
        citaId: row.cita_id ?? undefined,
        fecha: row.fecha,
        hora: row.hora,
        totalCobrado: row.total_cobrado === null ? undefined : Number(row.total_cobrado),
        registradoPor: row.registrado_por ?? undefined,
        creadoEn: row.creado_en,
    };
}
class VisitaRepository {
    async crear(data) {
        const result = await db_1.default.query(`INSERT INTO visitas (negocio_id, cliente_id, cita_id, fecha, hora, total_cobrado, registrado_por)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), COALESCE($5, CURRENT_TIME), $6, $7)
       RETURNING id, negocio_id, cliente_id, cita_id, fecha, hora, total_cobrado, registrado_por, creado_en`, [
            data.negocioId,
            data.clienteId,
            data.citaId ?? null,
            data.fecha ?? null,
            data.hora ?? null,
            data.totalCobrado ?? null,
            data.registradoPor ?? null,
        ]);
        return mapVisita(result.rows[0]);
    }
    async buscarPorId(id) {
        const result = await db_1.default.query(`SELECT id, negocio_id, cliente_id, cita_id, fecha, hora, total_cobrado, registrado_por, creado_en
       FROM visitas
       WHERE id = $1`, [id]);
        if (!result.rows[0]) {
            return null;
        }
        return mapVisita(result.rows[0]);
    }
    async buscarPorNegocio(negocioId) {
        const result = await db_1.default.query(`SELECT id, negocio_id, cliente_id, cita_id, fecha, hora, total_cobrado, registrado_por, creado_en
       FROM visitas
       WHERE negocio_id = $1
       ORDER BY fecha DESC, hora DESC`, [negocioId]);
        return result.rows.map(mapVisita);
    }
    async buscarPorNegocioYPeriodo(negocioId, desde, hasta) {
        const result = await db_1.default.query(`SELECT id, negocio_id, cliente_id, cita_id, fecha, hora, total_cobrado, registrado_por, creado_en
       FROM visitas
       WHERE negocio_id = $1
         AND fecha BETWEEN $2 AND $3
       ORDER BY fecha DESC`, [negocioId, desde, hasta]);
        return result.rows.map(mapVisita);
    }
    async buscarPorCliente(clienteId) {
        const result = await db_1.default.query(`SELECT id, negocio_id, cliente_id, cita_id, fecha, hora, total_cobrado, registrado_por, creado_en
       FROM visitas
       WHERE cliente_id = $1
       ORDER BY fecha DESC, hora DESC`, [clienteId]);
        return result.rows.map(mapVisita);
    }
}
exports.VisitaRepository = VisitaRepository;
