"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListarProfesionalesUseCase = void 0;
class ListarProfesionalesUseCase {
    constructor(profesionalRepository) {
        this.profesionalRepository = profesionalRepository;
    }
    async execute(negocioId) {
        return this.profesionalRepository.buscarPorNegocio(negocioId);
    }
}
exports.ListarProfesionalesUseCase = ListarProfesionalesUseCase;
