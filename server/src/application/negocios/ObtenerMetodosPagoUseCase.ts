import { IMetodosDePagoRepository } from "../../domain/repositories/IMetodosDePagoRepository";

export class ObtenerMetodosPagoUseCase{
    constructor(private metodosPagoRepo: IMetodosDePagoRepository){}

    async execute(negocioId: string){
        const result = await this.metodosPagoRepo.obtener(negocioId);

        return result;
    }
}