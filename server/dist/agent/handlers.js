"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ejecutarHerramienta = ejecutarHerramienta;
const ServicioRepository_1 = require("../infraestructure/repositories/ServicioRepository");
const CitaRepository_1 = require("../infraestructure/repositories/CitaRepository");
const ConversacionRepository_1 = require("../infraestructure/repositories/ConversacionRepository");
async function ejecutarHerramienta(nombre, input, negocioId, conversacionId) {
    try {
        if (nombre === "consultar_servicios") {
            const servicioRepo = new ServicioRepository_1.ServicioRepository();
            const servicios = await servicioRepo.buscarPorNegocio(negocioId);
            if (servicios.length === 0) {
                return "Este negocio no tiene servicios aun.";
            }
            return servicios.map(s => `${s.nombre}: $${s.precioBase}`).join('\n');
        }
        if (nombre === "consultar_disponibilidad") {
            const arrayHorasDisponibles = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
            const citaRepo = new CitaRepository_1.CitaRepository();
            const citas = await citaRepo.buscarHorasOcupadas(negocioId, input.fecha);
            if (!citas) {
                return `Horas disponibles: ${arrayHorasDisponibles.join(',')}`;
            }
            const horasLibres = arrayHorasDisponibles.filter(h => !citas.includes(h));
            return `Horas disponibles: ${horasLibres.join(',')}`;
        }
        if (nombre === 'escalar_conversacion') {
            const conversacionRepo = new ConversacionRepository_1.ConversacionRepository();
            const actualizarConver = await conversacionRepo.actualizar(conversacionId, { estado: 'escalada' });
            if (!actualizarConver) {
                return 'No se pudo actualizar la conversacion';
            }
            return 'Conversacion escalada exitosamente. Un humano atenderá al cliente pronto.';
        }
        return "No se encontró una herramienta con ese nombre.";
    }
    catch (error) {
        return "Error obteniendo los servicios del negocio";
    }
}
