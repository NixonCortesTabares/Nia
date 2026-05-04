"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversacionRepository = void 0;
const db_1 = __importDefault(require("../../config/db"));
function mapConversacion(row) {
    return {
        id: row.id,
        negocioId: row.negocio_id,
        clienteId: row.cliente_id,
        tipo: row.tipo ?? undefined,
        estado: row.estado,
        resumen: row.resumen ?? undefined,
        iniciadaEn: row.iniciada_en,
        cerradaEn: row.cerrada_en ?? undefined,
    };
}
class ConversacionRepository {
    async buscarActiva(clienteId, negocioId) {
        const result = await db_1.default.query(`SELECT id, negocio_id, cliente_id, tipo, estado, resumen, iniciada_en, cerrada_en
       FROM conversaciones 
       WHERE estado = 'activa'
       AND cliente_id = $1
       AND negocio_id = $2`, [clienteId, negocioId]);
        if (!result.rows[0]) {
            return null;
        }
        return mapConversacion(result.rows[0]);
    }
    async crear(data) {
        const result = await db_1.default.query(`INSERT INTO conversaciones (negocio_id, cliente_id, tipo)
       VALUES ($1, $2, $3)
       RETURNING id, negocio_id, cliente_id, tipo, estado, resumen, iniciada_en, cerrada_en`, [data.negocioId, data.clienteId, data.tipo ?? null]);
        return mapConversacion(result.rows[0]);
    }
    async buscarPorId(id) {
        const result = await db_1.default.query(`SELECT id, negocio_id, cliente_id, tipo, estado, resumen, iniciada_en, cerrada_en
       FROM conversaciones
       WHERE id = $1`, [id]);
        if (!result.rows[0]) {
            return null;
        }
        return mapConversacion(result.rows[0]);
    }
    async actualizar(id, data) {
        const result = await db_1.default.query(`UPDATE conversaciones
       SET tipo = COALESCE($2, tipo),
           estado = COALESCE($3, estado),
           resumen = COALESCE($4, resumen),
           cerrada_en = COALESCE($5, cerrada_en)
       WHERE id = $1
       RETURNING id, negocio_id, cliente_id, tipo, estado, resumen, iniciada_en, cerrada_en`, [
            id,
            data.tipo ?? null,
            data.estado ?? null,
            data.resumen ?? null,
            data.cerradaEn ?? null,
        ]);
        if (!result.rows[0]) {
            return null;
        }
        return mapConversacion(result.rows[0]);
    }
}
exports.ConversacionRepository = ConversacionRepository;
