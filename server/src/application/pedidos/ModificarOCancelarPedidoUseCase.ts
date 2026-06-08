//import { metodoPago, TipoEntrega } from "../../domain/entities/Pedido";
import {IPedidoRepository } from "../../domain/repositories/IPedidoRepository";
import { GenerarPedidoResumen, GenerarPedidoUseCaseDTO } from "./GenerarPedidoUseCase";
import { PrepararPedidoService } from "./services/PrepararPedidoService";


//const tiposEntregaValidos: TipoEntrega[] = ['domicilio', 'recoger_en_local', 'consumo_en_local'];
//const metodosPagoValido: metodoPago[] = ['efectivo', 'transferencia']
//type tiposCambio = 'modificacion' | 'cancelacion';
export class ModificarOCancelarPedidoUseCase {
    constructor(
        private pedidoRepository: IPedidoRepository,
        private prepararPedidoService: PrepararPedidoService
    ) { }


    async executeModificacion(input: GenerarPedidoUseCaseDTO): Promise<GenerarPedidoResumen> 
    {

        try {

            const pedidoAModificarOCancelar =
                await this.pedidoRepository.buscarUltimoModificablePorConversacion(
                    input.negocioId,
                    input.conversacionId
                );

            if (!pedidoAModificarOCancelar) {
                throw new Error(`El cliente no tiene pedidos cancelables ni modificables. Si creaste un pedido recientemente para el explicale que ya esta en ruta, 
                    y no es posible cancelarlo ni modificarlo.
                    Si insiste, escala la conversacion.`);
            }
                    console.log('Entro a modificar');

                    const pedidoPreparado = await this.prepararPedidoService.execute(input);
                    
                    const pedidoCompleto = await this.pedidoRepository.cancelarYCrearCompleto(pedidoAModificarOCancelar.id, pedidoPreparado);

                return {
                    pedido: pedidoCompleto.pedido,
                    productos: pedidoCompleto.productos,
                    total: pedidoCompleto.pedido.total,
                };

            
        }
        catch (error) {
            console.log('Error al intentar modificar o cancelar el pedido.')
            console.log(error)

            if (error instanceof Error) {
                throw error;
            }

            throw new Error("Error al intentar modificar o cancelar el pedido.");
        }
    }

    async executeCancelacion(negocioId: string, conversacionId: string): Promise<string>{

        try{

            const pedidoAModificarOCancelar =
                await this.pedidoRepository.buscarUltimoModificablePorConversacion(
                    negocioId,
                    conversacionId
                );

            if (!pedidoAModificarOCancelar) {
                throw new Error(`El cliente no tiene pedidos cancelables ni modificables. Si creaste un pedido recientemente para el explicale que ya esta en ruta, 
                    y no es posible cancelarlo ni modificarlo.
                    Si insiste, escala la conversacion.`);
            }

                console.log('entro a cancelar');
                const pedidoACancelar = await this.pedidoRepository.cambiarEstado(pedidoAModificarOCancelar.id, negocioId, 'cancelado');
                if(!pedidoACancelar){
                    throw new Error('No se pudo cancelar el pedido encontrado.');
                }

                return "El pedido fue cancelado correctamente"
        }
        catch(error){
            console.log('Error al intentar cancelar el pedido', error);
            throw new Error('Error al intentar cancelar el pedido');
        }

    }
    }
