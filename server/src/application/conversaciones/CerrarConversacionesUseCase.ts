import { IConversacionRepository } from "../../domain/repositories/IConversacionRepository";

export class CerrarConversacionesUseCase{
    constructor(private conversacionRepo: IConversacionRepository){}

    async execute(){
       await this.conversacionRepo.cerrarConversaciones();
    }
}