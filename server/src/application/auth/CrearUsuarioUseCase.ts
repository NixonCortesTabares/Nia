import { CrearUsuarioDTO } from "../../domain/entities/Usuario";
import { IUsuarioRepository } from "../../domain/repositories/IUsuarioRepositoriy";
import bcrypt from 'bcryptjs';
export class CrearUsuarioUseCase {
    constructor(private usuarioRepository: IUsuarioRepository) { }

    async execute(duenoId: string, negocioId: string, data: CrearUsuarioDTO) {

            const dueno = await this.usuarioRepository.buscarPorId(duenoId);

            if (dueno?.rol !== 'dueno') {
                throw new Error("No se sabe quien esta realizando la solicitud, o no es el dueño");
            }

            if (!data.nombre || data.nombre.length < 2) {
                throw new Error('Debe proporcionar el nombre del usuario, o es muy corto.');
            }

            if (!data.passwordHash || data.passwordHash.length < 4) {
                throw new Error('La constraseña es muy corta, son minimo 4 caracteres.');
            }

            if(!data.email){
                throw new Error('Debe proporcionar un correo electronico válido.');
            }

            const usuarioExistente = await this.usuarioRepository
                .buscarPorEmail(data.email);

            if (usuarioExistente) {
                throw new Error('Ya existe una cuenta con ese email');
            }

            const passwordHash = await bcrypt.hash(data.passwordHash, 10);

            // Crear el usuario dueño
            const usuario = await this.usuarioRepository.crear({
                negocioId: negocioId,
                nombre: data.nombre,
                email: data.email,
                passwordHash,
                rol: data.rol ?? 'staff',
            });

            return {
                negocioId: negocioId,
                usuarioId: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
            };
        
    }
}