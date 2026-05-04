"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesactivarServicioUseCase = void 0;
class DesactivarServicioUseCase {
    constructor(servicioRepository) {
        this.servicioRepository = servicioRepository;
    }
    async execute(input) {
        const servicio = await this.servicioRepository.buscarPorId(input.id);
        if (!servicio) {
            return null;
        }
        if (servicio.negocioId !== input.negocioId) {
            throw new Error('No autorizado');
        }
        return this.servicioRepository.desactivar(input.id);
    }
}
exports.DesactivarServicioUseCase = DesactivarServicioUseCase;
