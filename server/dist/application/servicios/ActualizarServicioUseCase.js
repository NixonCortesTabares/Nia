"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActualizarServicioUseCase = void 0;
class ActualizarServicioUseCase {
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
        return this.servicioRepository.actualizar(input.id, input.data);
    }
}
exports.ActualizarServicioUseCase = ActualizarServicioUseCase;
