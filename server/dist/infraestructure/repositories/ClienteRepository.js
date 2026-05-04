"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClienteRepository = void 0;
const db_1 = __importDefault(require("../../config/db"));
function mapCliente(row) {
    return {
        id: row.id,
        negocioId: row.negocio_id,
        nombre: row.nombre ?? undefined,
        telefono: row.telefono,
        primeraVisita: row.primera_visita ?? undefined,
        ultimaVisita: row.ultima_visita ?? undefined,
        totalVisitas: row.total_visitas,
        activo: row.activo,
        creadoEn: row.creado_en,
    };
}
class ClienteRepository {
    async crear(data) {
        const result = await db_1.default.query(`INSERT INTO clientes (negocio_id, telefono, nombre)
       VALUES ($1, $2, $3)
       RETURNING id, negocio_id, nombre, telefono, primera_visita, ultima_visita, total_visitas, activo, creado_en`, [data.negocioId, data.telefono, data.nombre ?? null]);
        return mapCliente(result.rows[0]);
    }
    async buscarPorTelefono(negocioId, telefono) {
        const result = await db_1.default.query(`SELECT id, negocio_id, nombre, telefono, primera_visita, ultima_visita, total_visitas, activo, creado_en
       FROM clientes
       WHERE negocio_id = $1 AND telefono = $2`, [negocioId, telefono]);
        if (!result.rows[0]) {
            return null;
        }
        return mapCliente(result.rows[0]);
    }
    async buscarPorId(id) {
        const result = await db_1.default.query(`SELECT id, negocio_id, nombre, telefono, primera_visita, ultima_visita, total_visitas, activo, creado_en
       FROM clientes
       WHERE id = $1`, [id]);
        if (!result.rows[0]) {
            return null;
        }
        return mapCliente(result.rows[0]);
    }
    async buscarEnRiesgo(negocioId) {
        const result = await db_1.default.query(`SELECT id, negocio_id, nombre, telefono, primera_visita, ultima_visita, total_visitas, activo, creado_en
       FROM clientes
       WHERE negocio_id = $1
         AND activo = true
         AND ultima_visita IS NOT NULL
         AND ultima_visita <= CURRENT_DATE - INTERVAL '30 days'
       ORDER BY ultima_visita ASC`, [negocioId]);
        return result.rows.map(mapCliente);
    }
    async buscarInactivosDesdeFecha(negocioId, desde) {
        const result = await db_1.default.query(`SELECT id, negocio_id, nombre, telefono, primera_visita, ultima_visita, total_visitas, activo, creado_en
       FROM clientes
       WHERE negocio_id = $1
         AND activo = true
         AND (ultima_visita IS NULL OR ultima_visita < $2)
       ORDER BY ultima_visita ASC NULLS FIRST`, [negocioId, desde]);
        return result.rows.map(mapCliente);
    }
    async actualizarUltimaVisita(id) {
        await db_1.default.query(`UPDATE clientes
       SET primera_visita = COALESCE(primera_visita, CURRENT_DATE),
           ultima_visita = CURRENT_DATE,
           total_visitas = total_visitas + 1
       WHERE id = $1`, [id]);
    }
}
exports.ClienteRepository = ClienteRepository;
