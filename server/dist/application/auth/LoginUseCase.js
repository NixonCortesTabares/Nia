"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class LoginUseCase {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }
    async execute(data) {
        const usuario = await this.usuarioRepository.buscarPorEmail(data.email);
        if (!usuario || !usuario.activo) {
            throw new Error('Credenciales invalidas');
        }
        const passwordValido = await bcryptjs_1.default.compare(data.password, usuario.passwordHash);
        if (!passwordValido) {
            throw new Error('Credenciales invalidas');
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET no esta configurado');
        }
        const token = jsonwebtoken_1.default.sign({
            usuarioId: usuario.id,
            negocioId: usuario.negocioId,
            rol: usuario.rol,
        }, jwtSecret, { expiresIn: '8h' });
        return {
            token,
            usuario: {
                id: usuario.id,
                negocioId: usuario.negocioId,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
            },
        };
    }
}
exports.LoginUseCase = LoginUseCase;
