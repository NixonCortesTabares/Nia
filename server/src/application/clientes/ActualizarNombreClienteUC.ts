import { IClienteRepository } from "../../domain/repositories/IClienteRepository";

export class ActualizarNombreClienteUC{ 
    constructor(private clienteRepo: IClienteRepository){}


    async execute(id: string, nombre: string, negocioId: string){
        const clienteActualizado = await this.clienteRepo.actualizar(id, {nombre: nombre}, negocioId);

        if(!clienteActualizado){
            throw new Error('NO SE PUDO ACTUALIZAR EL NOMBRE DEL CLIENTE, VERIFICAR ActualizarNombreClienteUC')
        }
    }
}