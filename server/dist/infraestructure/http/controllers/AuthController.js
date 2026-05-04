"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const RegisterUseCase_1 = require("../../../application/auth/RegisterUseCase");
const LoginUseCase_1 = require("../../../application/auth/LoginUseCase");
const NegocioRepository_1 = require("../../repositories/NegocioRepository");
const UsuarioRepository_1 = require("../../repositories/UsuarioRepository");
class AuthController {
    async register(req, res) {
        try {
            const negocioRepository = new NegocioRepository_1.NegocioRepository();
            const usuarioRepository = new UsuarioRepository_1.UsuarioRepository();
            const registerUseCase = new RegisterUseCase_1.RegisterUseCase(negocioRepository, usuarioRepository);
            const resultado = await registerUseCase.execute(req.body);
            res.status(201).json({
                ok: true,
                data: resultado,
            });
        }
        catch (error) {
            res.status(400).json({
                ok: false,
                message: error instanceof Error ? error.message : 'Error al registrar',
            });
        }
    }
    async login(req, res) {
        try {
            const usuarioRepository = new UsuarioRepository_1.UsuarioRepository();
            const loginUseCase = new LoginUseCase_1.LoginUseCase(usuarioRepository);
            const resultado = await loginUseCase.execute(req.body);
            res.status(200).json({
                ok: true,
                data: resultado,
            });
        }
        catch (error) {
            res.status(401).json({
                ok: false,
                message: error instanceof Error ? error.message : 'Error al iniciar sesion',
            });
        }
    }
}
exports.AuthController = AuthController;
