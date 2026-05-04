"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUseCase = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class RegisterUseCase {
    constructor(negocioRepository, usuarioRepository) {
        this.negocioRepository = negocioRepository;
        this.usuarioRepository = usuarioRepository;
    }
    async execute(data) {
        // Verificar que el email no esté registrado
        const usuarioExistente = await this.usuarioRepository
            .buscarPorEmail(data.email);
        if (usuarioExistente) {
            throw new Error('Ya existe una cuenta con ese email');
        }
        // Crear el negocio
        const negocio = await this.negocioRepository.crear({
            nombre: data.negocioNombre,
            tipo: data.negocioTipo,
            ciudad: data.negocioCiudad,
            direccion: data.negocioDireccion,
        });
        // Hashear la contraseña
        const passwordHash = await bcryptjs_1.default.hash(data.password, 10);
        // Crear el usuario dueño
        const usuario = await this.usuarioRepository.crear({
            negocioId: negocio.id,
            nombre: data.nombre,
            email: data.email,
            passwordHash,
            rol: 'dueno',
        });
        return {
            negocioId: negocio.id,
            usuarioId: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
        };
    }
}
exports.RegisterUseCase = RegisterUseCase;
