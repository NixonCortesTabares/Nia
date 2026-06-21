import { INegocioRepository } from '../../domain/repositories/INegocioRepository';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepositoriy';
import { CrearNegocioDTO } from '../../domain/entities/Negocio';
import bcrypt from 'bcryptjs';

export interface RegisterDTO {
  // Datos del negocio
  negocioNombre: string;
  negocioTipo: string;
  negocioCiudad?: string;
  negocioDireccion?: string;
  // Datos del dueño
  nombre: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  negocioId: string;
  usuarioId: string;
  nombre: string;   
  email: string;
}

export class RegisterUseCase {
  constructor(
    private negocioRepository: INegocioRepository,
    private usuarioRepository: IUsuarioRepository
  ) {}

  async execute(data: RegisterDTO): Promise<RegisterResult> {

    if(!data.email){
      throw new Error('Debe proporcionar un correo electronico válido.');
    }

    if(!data.negocioNombre || data.negocioNombre.length < 2){
      throw new Error('Debe proporcionar un nombre para el negocio válido.');
    }

    if(!data.nombre || data.nombre.length < 2){
      throw new Error('Debe proporcionar un nombre para el dueño válido.');
    }

    if(!data.password || data.password.length < 4){
      throw new Error('Debe proporcionar una contraseña de al menos 4 caracteres');
    }
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
    const passwordHash = await bcrypt.hash(data.password, 10);

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
