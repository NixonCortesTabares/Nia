import { ResponseStreamingParams } from "openai/lib/responses/ResponseStream.js";
import { Extra } from "../../domain/entities/Extra";
import { ICategoriaExtraRepository } from "../../domain/repositories/ICategoriaExtraRepository";
import { ICategoriaRepository } from "../../domain/repositories/ICategoriaRepository";

export interface infoCategoria{
    nombre: string,
    activo: boolean,
    extras: {
        id: string,
        nombre: string,
        valor: number,
        activo: boolean
    }[]
}
export class BuscarInfoExtrasDeCategoriaUseCase{
    constructor(private cateRepo: ICategoriaRepository){}

    async execute(id: string, negocioId: string): Promise<infoCategoria>{
        const resultado = await this.cateRepo.obtenerInfoExtrasCategoria(id, negocioId);

        return resultado;
    }
}