import { IExtraRepository } from "../../domain/repositories/IExtraRepository";

export class BuscarExtraPorIdUseCase{
    constructor(private extraRepo: IExtraRepository){}

    async execute(id: string, negocioId: string){
        const result = await this.extraRepo.buscarPorId(id, negocioId);

        return result;
    }
}