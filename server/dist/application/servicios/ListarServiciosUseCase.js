"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListarServiciosUseCase = void 0;
class ListarServiciosUseCase {
    constructor(servicioRepository) {
        this.servicioRepository = servicioRepository;
    }
    async execute(negocioId) {
        return this.servicioRepository.buscarPorNegocio(negocioId);
    }
}
exports.ListarServiciosUseCase = ListarServiciosUseCase;
