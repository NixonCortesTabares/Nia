"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObtenerProfesionalUseCase = void 0;
class ObtenerProfesionalUseCase {
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
        return profesional;
    }
}
exports.ObtenerProfesionalUseCase = ObtenerProfesionalUseCase;
