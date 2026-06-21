import { IExtraRepository } from "../../domain/repositories/IExtraRepository";

export class ListarExtrasPorCategoriaUseCase{
    constructor(private extraRepo: IExtraRepository){}

    async execute(categoriaId: string, negocioId: string){

        const resultado = await this.extraRepo.buscarPorCategoriaId(categoriaId, negocioId);

        return resultado;

    }
}