import { enviarMensaje } from "../../agent/whatsapp";
import { EstadoPedido } from "../../domain/entities/Pedido";
import { IClienteRepository } from "../../domain/repositories/IClienteRepository";
import { IConversacionRepository } from "../../domain/repositories/IConversacionRepository";
import { INegocioRepository } from "../../domain/repositories/INegocioRepository";
import { IPedidoRepository } from "../../domain/repositories/IPedidoRepository";

export class EnviarMensajeEstadoPedidoActualizadoUseCase {
    constructor(private negocioRepo: INegocioRepository, private pedidoRepo: IPedidoRepository, 
        private clienteRepo: IClienteRepository, private conversacionRepo: IConversacionRepository) { }

    async execute(estado: EstadoPedido, pedidoId: string, negocioId: string) {
        const negocio = await this.negocioRepo.buscarPorId(negocioId);

        if (!negocio) {
            throw new Error('No se pudo encontrar el negocio.');
        }

        if (negocio.activo === false) {
            throw new Error('Negocio inactivo.');
        }

        if (!negocio.telefonoWs) {
            throw new Error('no tiene un id del telefono establecido.');
        }

        const pedido = await this.pedidoRepo.buscarPorId(pedidoId, negocioId);
        if (!pedido) {
            throw new Error('No se pudo encontrar el pedido');
        }

        const cliente = await this.clienteRepo.buscarPorId(pedido.clienteId);

        if (!cliente?.telefono) {
            throw new Error('El cliente no tiene un numero de telefono establecido.');
        }

        if (estado === 'en_cocina') {
            await enviarMensaje(cliente.telefono, "Tu pedido ya esta siendo preparado!", negocio.telefonoWs);
        }

        if (estado === 'en_ruta') {
            if(!pedido.direccionEntrega){
                await enviarMensaje(cliente.telefono, "Tu pedido ya esta listo para que pases por él!", negocio.telefonoWs);
            }
            else{
                await enviarMensaje(cliente.telefono, "Tu pedido ya salió para allá!", negocio.telefonoWs);
            } 
        }

        if (estado === 'entregado') {
            await enviarMensaje(cliente.telefono, "Esperamos que disfrutes de tu comida", negocio.telefonoWs);
            //await this.conversacionRepo.actualizar(pedido.conversacionId, { estado: 'resuelta' });
        }
    }
}