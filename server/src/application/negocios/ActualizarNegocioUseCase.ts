import { EditarNegocioDTO, Negocio } from "../../domain/entities/Negocio";
import { INegocioRepository } from "../../domain/repositories/INegocioRepository";

export class ActualizarNegocioUseCase {
    constructor(private negocioRepo: INegocioRepository) { }

    async execute(id: string, data: EditarNegocioDTO):Promise<Negocio | null> {
        const resultado = await this.negocioRepo.editar(id, {
            nombre: data.nombre,
            ciudad: data.ciudad,
            direccion: data.direccion,
        });

        return resultado;
    }
}