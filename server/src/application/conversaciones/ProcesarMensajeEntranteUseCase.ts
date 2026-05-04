import { INegocioRepository } from '../../domain/repositories/INegocioRepository';
import { IConversacionRepository } from '../../domain/repositories/IConversacionRepository';
import { IMensajeRepository } from '../../domain/repositories/IMensajeRepository';
import { IClienteRepository } from '../../domain/repositories/IClienteRepository';

export interface WhatsappData {
    wamid: string,
    from: string,
    text: string,
    phoneId: string,
}
export class ProcesarMensajeEntranteUseCase {
    constructor(private negocioRepository: INegocioRepository,
        private conversacionRepository: IConversacionRepository,
        private mensajeRepository: IMensajeRepository,
        private clienteRepository: IClienteRepository) { }
    async execute(data: WhatsappData) {
        const negocio = await this.negocioRepository.buscarPorTelefonoWs(data.phoneId);

        if (!negocio) {
            throw new Error('Negocio no encontrado');
        }

        let cliente = await this.clienteRepository.buscarPorTelefono(negocio.id, data.from);
        if (!cliente) {
            const clienteCreado = await this.clienteRepository.crear(
                {
                    negocioId: negocio.id,
                    telefono: data.from,
                }
            )
            if (!clienteCreado) {
                throw new Error("No se pudo encontrar ni crear el cliente");
            }
            cliente = clienteCreado;
        }
        let conversacionActiva = await this.conversacionRepository.buscarActiva(cliente.id, negocio.id);

        if (!conversacionActiva) {
            const crearConversacion = await this.conversacionRepository.crear({
                negocioId: negocio.id,
                clienteId: cliente.id
            });
            conversacionActiva = crearConversacion;
        }

        const guardarMensaje = await this.mensajeRepository.crear({
            conversacionId: conversacionActiva.id,
            rol: 'cliente',
            contenido: data.text,
            wamid: data.wamid
        });

        return {
            negocio,
            cliente,
            conversacion: conversacionActiva,
            mensaje: guardarMensaje
        };
    }
}