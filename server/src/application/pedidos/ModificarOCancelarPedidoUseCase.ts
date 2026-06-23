//import { metodoPago, TipoEntrega } from "../../domain/entities/Pedido";
import { enviarMensaje } from "../../agent/whatsapp";
import { INegocioRepository } from "../../domain/repositories/INegocioRepository";
import { IPedidoRepository } from "../../domain/repositories/IPedidoRepository";
import { GenerarPedidoResumen, GenerarPedidoUseCaseDTO } from "./GenerarPedidoUseCase";
import { PrepararPedidoService } from "./services/PrepararPedidoService";


//const tiposEntregaValidos: TipoEntrega[] = ['domicilio', 'recoger_en_local', 'consumo_en_local'];
//const metodosPagoValido: metodoPago[] = ['efectivo', 'transferencia']
//type tiposCambio = 'modificacion' | 'cancelacion';
export class ModificarOCancelarPedidoUseCase {
    constructor(
        private pedidoRepository: IPedidoRepository,
        private prepararPedidoService: PrepararPedidoService,
        private negocioRepo: INegocioRepository
    ) { }


    async executeModificacion(input: GenerarPedidoUseCaseDTO): Promise<GenerarPedidoResumen | null> {

        try {

            const pedidoAModificarOCancelar =
                await this.pedidoRepository.buscarUltimoModificablePorConversacion(
                    input.negocioId,
                    input.conversacionId
                );

            const negocio = await this.negocioRepo.buscarPorId(input.negocioId);

            if (!negocio?.telefonoWs) {
                throw new Error('No se pudo encontrar el negocio o no tiene un id de whatsapp configurado.');
            }

            if (!pedidoAModificarOCancelar) {
                throw new Error('No tiene pedidos.');
            }
            const now = new Date();
            const hechoEn = pedidoAModificarOCancelar.creadoEn;
            const diferencia = now.getTime() - hechoEn.getTime();

            if (diferencia >= 240000) {
                return null;
            }
            const pedidoPreparado = await this.prepararPedidoService.execute(input);
            const pedidoCompleto = await this.pedidoRepository.cancelarYCrearCompleto(pedidoAModificarOCancelar.id, pedidoPreparado);
            return {
                pedido: pedidoCompleto.pedido,
                productos: pedidoCompleto.productos,
                total: pedidoCompleto.pedido.total,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Error al intentar modificar o cancelar el pedido.");
        }
    }

    async executeCancelacion(negocioId: string, conversacionId: string): Promise<string | null> {

        try {

            const pedidoAModificarOCancelar =
                await this.pedidoRepository.buscarUltimoModificablePorConversacion(
                    negocioId,
                    conversacionId
                );

            if (!pedidoAModificarOCancelar) {
                throw new Error(`El cliente no tiene pedidos cancelables ni modificables. Si creaste un pedido recientemente 
                    para el explicale que ya esta en ruta, y no es posible cancelarlo ni modificarlo.
                    Si insiste, escala la conversacion.`);
            }

            const now = new Date();
            const hechoEn = pedidoAModificarOCancelar.creadoEn;
            const diferencia = now.getTime() - hechoEn.getTime();

            if (diferencia >= 200000) {
                return null
            }

            const pedidoACancelar = await this.pedidoRepository.cambiarEstado(pedidoAModificarOCancelar.id, negocioId, 'cancelado');
            if (!pedidoACancelar) {
                throw new Error('No se pudo cancelar el pedido encontrado.');
            }

            return "El pedido fue cancelado correctamente"
        }
        catch (error) {
            console.log('Error al intentar cancelar el pedido', error);
            throw new Error('Error al intentar cancelar el pedido');
        }

    }
}
