import { Request, Response } from 'express';
import { RegisterUseCase } from '../../../application/auth/RegisterUseCase';
import { LoginUseCase } from '../../../application/auth/LoginUseCase';
import { CrearUsuarioUseCase } from '../../../application/auth/CrearUsuarioUseCase';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepositoriy';
import { INegocioRepository } from '../../../domain/repositories/INegocioRepository';
import { CrearUsuarioDTO } from '../../../domain/entities/Usuario';

export class AuthController {

  constructor(private usuarioRepo: IUsuarioRepository, private negocioRepo: INegocioRepository) { }
  async register(req: Request, res: Response) {
    try {

      const registerSecret = process.env.REGISTER_SECRET;

      if (!registerSecret) {
        return res.status(500).json({
          ok: false,
          mensaje: 'REGISTER_SECRET no está configurado.',
        });
      }

      if (req.body.registerSecret !== registerSecret) {
        return res.status(403).json({
          ok: false,
          mensaje: 'No tienes permiso para registrar negocios.',
        });
      }
      const registerUseCase = new RegisterUseCase(this.negocioRepo, this.usuarioRepo);
      const resultado = await registerUseCase.execute(req.body);

      return res.status(201).json({
        ok: true,
        mensaje: 'Registro exitoso.',
        data: resultado,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        ok: false,
        message: 'Error al registrar',
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const loginUseCase = new LoginUseCase(this.usuarioRepo);
      const resultado = await loginUseCase.execute(req.body);

      return res.status(200).json({
        ok: true,
        data: resultado,
      });
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        ok: false,
        mensaje:error instanceof Error
          ? error.message
          : 'Error al iniciar sesion',
      });
    }
  }

  async crearUsuario(req: Request, res: Response) {

    if (!req.user?.usuarioId) {
      return res.status(401).json({
        ok: false,
        mensaje: "Error, no autenticado."
      })
    }

    try {
      const crearUsuarUseCase = new CrearUsuarioUseCase(this.usuarioRepo);


      const data: CrearUsuarioDTO = {
        negocioId: req.user.negocioId,
        nombre: req.body.nombre,
        email: req.body.email,
        passwordHash: req.body.password,
        rol: 'staff'
      };

      const result = await crearUsuarUseCase.execute(req.user.usuarioId, req.user.negocioId, data);

      console.log('Usuario creado exitosamente.');
      return res.status(201).json({
        ok: true,
        mensaje: 'Usuario creado exitosamente',
        data: result
      })

    }
    catch (error) {
      console.log(`Error al crear el Usuario ${error}`);
      return res.status(400).json({
        ok: false,
        mensaje: error instanceof Error
          ? error.message
          : 'Error interno del servidor.'
      })
    }

  }
}
