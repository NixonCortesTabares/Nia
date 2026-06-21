import { Negocio } from "../../domain/entities/Negocio";
import { INegocioRepository } from "../../domain/repositories/INegocioRepository";

export class ObtenerNegocioPorIdUseCase{
    constructor(private negocioRepo: INegocioRepository){}

    async execute(id: string): Promise<Negocio | null>{
        const resultado = await this.negocioRepo.buscarPorId(id);
        return resultado;
    }
}