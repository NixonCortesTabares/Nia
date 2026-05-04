import { Request, Response } from 'express';
import { RegisterUseCase } from '../../../application/auth/RegisterUseCase';
import { LoginUseCase } from '../../../application/auth/LoginUseCase';
import { NegocioRepository } from '../../repositories/NegocioRepository';
import { UsuarioRepository } from '../../repositories/UsuarioRepository';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const negocioRepository = new NegocioRepository();
      const usuarioRepository = new UsuarioRepository();
      const registerUseCase = new RegisterUseCase(negocioRepository, usuarioRepository);

      const resultado = await registerUseCase.execute(req.body);

      res.status(201).json({
        ok: true,
        data: resultado,
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        message: error instanceof Error ? error.message : 'Error al registrar',
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const usuarioRepository = new UsuarioRepository();
      const loginUseCase = new LoginUseCase(usuarioRepository);

      const resultado = await loginUseCase.execute(req.body);

      res.status(200).json({
        ok: true,
        data: resultado,
      });
    } catch (error) {
      res.status(401).json({
        ok: false,
        message: error instanceof Error ? error.message : 'Error al iniciar sesion',
      });
    }
  }
}
