import { Usuario, CrearUsuarioDTO } from '../entities/Usuario';

export interface IUsuarioRepository {
  crear(data: CrearUsuarioDTO): Promise<Usuario>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorId(id: string): Promise<Usuario | null>;
}