import { ICategoriaExtraRepository } from "../../domain/repositories/ICategoriaExtraRepository";

export class QuitarExtraDeCategoriaUseCase{
    constructor(private categoriasExtrasRepo:ICategoriaExtraRepository){}

    async execute(extraId: string, negocioId: string, categoriaId: string){
        const resultado = this.categoriasExtrasRepo.desactivar(extraId, negocioId, categoriaId);

        return resultado;
    }
}