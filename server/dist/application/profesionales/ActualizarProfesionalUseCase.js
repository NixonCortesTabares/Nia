"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActualizarProfesionalUseCase = void 0;
class ActualizarProfesionalUseCase {
    constructor(profesionalRepository) {
        this.profesionalRepository = profesionalRepository;
    }
    async execute(input) {
        const profesional = await this.profesionalRepository.buscarPorId(input.id);
        if (!profesional) {
            return null;
        }
        if (profesional.negocioId !== input.negocioId) {
            throw new Error('No autorizado');
        }
        return this.profesionalRepository.actualizar(input.id, input.data);
    }
}
exports.ActualizarProfesionalUseCase = ActualizarProfesionalUseCase;
