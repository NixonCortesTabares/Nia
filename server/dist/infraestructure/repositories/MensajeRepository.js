"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MensajeRepository = void 0;
const db_1 = __importDefault(require("../../config/db"));
function mapMensaje(row) {
    return {
        id: row.id,
        conversacionId: row.conversacion_id,
        rol: row.rol,
        contenido: row.contenido,
        wamid: row.wamid,
        enviadoEn: row.enviado_en,
    };
}
class MensajeRepository {
    async crear(data) {
        const result = await db_1.default.query(`INSERT INTO mensajes (conversacion_id, rol, contenido, wamid)
       VALUES ($1, $2, $3, $4)
       RETURNING id, conversacion_id, rol, contenido, wamid, enviado_en`, [data.conversacionId, data.rol, data.contenido, data.wamid]);
        return mapMensaje(result.rows[0]);
    }
    async buscarPorConversacion(conversacionId) {
        const result = await db_1.default.query(`SELECT id, conversacion_id, rol, contenido, wamid, enviado_en
       FROM mensajes
       WHERE conversacion_id = $1
       ORDER BY enviado_en ASC`, [conversacionId]);
        return result.rows.map(mapMensaje);
    }
}
exports.MensajeRepository = MensajeRepository;
