"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcesarMensajeEntranteUseCase = void 0;
class ProcesarMensajeEntranteUseCase {
    constructor(negocioRepository, conversacionRepository, mensajeRepository, clienteRepository) {
        this.negocioRepository = negocioRepository;
        this.conversacionRepository = conversacionRepository;
        this.mensajeRepository = mensajeRepository;
        this.clienteRepository = clienteRepository;
    }
    async execute(data) {
        const negocio = await this.negocioRepository.buscarPorTelefonoWs(data.phoneId);
        if (!negocio) {
            throw new Error('Negocio no encontrado');
        }
        let cliente = await this.clienteRepository.buscarPorTelefono(negocio.id, data.from);
        if (!cliente) {
            const clienteCreado = await this.clienteRepository.crear({
                negocioId: negocio.id,
                telefono: data.from,
            });
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
exports.ProcesarMensajeEntranteUseCase = ProcesarMensajeEntranteUseCase;
