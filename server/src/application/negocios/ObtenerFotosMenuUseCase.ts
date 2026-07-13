import { FotosNegocio } from "../../domain/entities/FotosNegocio";
import { IFotosNegocioRepository } from "../../domain/repositories/IFotosNegocioRepository";

export class ObtenerFotosMenuUseCase{
    constructor(private fotosNegocioRepo: IFotosNegocioRepository){}

    async execute(negocioId: string): Promise<FotosNegocio[]>{
        const resultado = await this.fotosNegocioRepo.obtener(negocioId);

        return resultado;
    }
}