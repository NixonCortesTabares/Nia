import { IConversacionRepository } from "../../domain/repositories/IConversacionRepository";

export class CerrarConversacionUseCase{
    constructor(private conversacionRepo: IConversacionRepository){}

    async execute(conversacionId: string, estado: string){
        if(estado === 'entregado'){
            await this.conversacionRepo.actualizar(conversacionId, {estado: 'resuelta'});
        }
       
    }
}