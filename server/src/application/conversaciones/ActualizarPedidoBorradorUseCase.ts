import { PedidoBorradorItem } from "../../domain/entities/Conversacion";
import { IConversacionRepository } from "../../domain/repositories/IConversacionRepository";

export class ActualizarPedidoBorradorUseCase{
    constructor(private conversacionRepo: IConversacionRepository){}

    async execute(conversacionId: string, items: PedidoBorradorItem[], negocioId: string){
       await this.conversacionRepo.actualizarItemsPedidoBorrador(conversacionId, items, negocioId);
    }
}