"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrearProfesionalUseCase = void 0;
class CrearProfesionalUseCase {
    constructor(profesionalRepository) {
        this.profesionalRepository = profesionalRepository;
    }
    async execute(data) {
        return this.profesionalRepository.crear(data);
    }
}
exports.CrearProfesionalUseCase = CrearProfesionalUseCase;
