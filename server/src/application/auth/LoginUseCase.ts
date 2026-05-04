import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginDTO } from '../../domain/entities/Usuario';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepositoriy';

export interface LoginResult {
  token: string;
  usuario: {
    id: string;
    negocioId: string;
    nombre: string;
    email: string;
    rol: 'dueno' | 'staff';
  };
}

export class LoginUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async execute(data: LoginDTO): Promise<LoginResult> {
    const usuario = await this.usuarioRepository.buscarPorEmail(data.email);

    if (!usuario || !usuario.activo) {
      throw new Error('Credenciales invalidas');
    }

    const passwordValido = await bcrypt.compare(
      data.password,
      usuario.passwordHash
    );

    if (!passwordValido) {
      throw new Error('Credenciales invalidas');
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET no esta configurado');
    }

    const token = jwt.sign(
      {
        usuarioId: usuario.id,
        negocioId: usuario.negocioId,
        rol: usuario.rol,
      },
      jwtSecret,
      { expiresIn: '8h' }
    );

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
