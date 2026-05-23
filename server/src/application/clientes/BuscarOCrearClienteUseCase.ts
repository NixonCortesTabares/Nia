import { Cliente, CrearClienteDTO } from "../../domain/entities/Cliente";
import { IClienteRepository } from "../../domain/repositories/IClienteRepository";
import { INegocioRepository } from "../../domain/repositories/INegocioRepository";

export class BuscarOCrearClienteUseCase {
    constructor(private clienteRepo: IClienteRepository, private negocioRepo: INegocioRepository) { }

    async execute(input: CrearClienteDTO): Promise<Cliente> {

        if (!input.negocioId) {
            throw new Error('El negocioId es obligatorio.');
        }
        const negocio = await this.negocioRepo.buscarPorId(input.negocioId);

        if (!negocio) {
            throw new Error('El negocio no existe.');
        }

        if (!negocio.activo) {
            throw new Error('El negocio no está activo.');
        }

        if (typeof input.telefono !== 'string' || !input.telefono.trim()) {
            throw new Error('El teléfono del cliente es obligatorio.');
        }

        const telefono = input.telefono.replace(/\D/g, '');

        if (telefono.length < 10 || telefono.length > 15) {
            throw new Error('El teléfono del cliente no tiene un formato válido.');
        }

        const nombreNormalizado =
  typeof input.nombre === 'string'
    ? input.nombre.trim() || undefined
    : undefined;

        const clienteExistente = await this.clienteRepo.buscarPorTelefono(input.negocioId, telefono)

        if (clienteExistente) {
            if (!clienteExistente.nombre && nombreNormalizado) {
                const clienteActualizado = await this.clienteRepo.actualizar(clienteExistente.id, {
                    nombre: nombreNormalizado,
            }, input.negocioId);

                return clienteActualizado ?? clienteExistente;
            }

            return clienteExistente;
        }

        return this.clienteRepo.crear({
            negocioId: input.negocioId,
            telefono,
            nombre: nombreNormalizado,
        });
}
}