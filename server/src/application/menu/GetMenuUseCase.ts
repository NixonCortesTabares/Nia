import { INegocioRepository } from "../../domain/repositories/INegocioRepository";

export class GetMenuUseCase{
    constructor(private negocioRepo: INegocioRepository){}

    async execute(wamid: string){
        return await this.negocioRepo.getMenuRestaurante(wamid);
    }
}