"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrearServicioUseCase = void 0;
class CrearServicioUseCase {
    constructor(servicioRepository) {
        this.servicioRepository = servicioRepository;
    }
    async execute(data) {
        return this.servicioRepository.crear(data);
    }
}
exports.CrearServicioUseCase = CrearServicioUseCase;
