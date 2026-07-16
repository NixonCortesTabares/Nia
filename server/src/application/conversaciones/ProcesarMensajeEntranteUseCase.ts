import { INegocioRepository } from '../../domain/repositories/INegocioRepository';
import { IConversacionRepository } from '../../domain/repositories/IConversacionRepository';
import { IMensajeRepository } from '../../domain/repositories/IMensajeRepository';
import { IClienteRepository } from '../../domain/repositories/IClienteRepository';
import { GetMenuUseCase } from '../menu/GetMenuUseCase';
import { enviarMensaje } from '../../agent/whatsapp';
import { pdfwhatsapp } from '../../agent/pdfwhatsapp';
import { imgwhatsapp } from '../../agent/imgwhatsapp';
import { ObtenerFotosMenuUseCase } from '../negocios/ObtenerFotosMenuUseCase';
import { FotosNegocioRepository } from '../../infraestructure/repositories/FotosNegocioRepository';
const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export interface WhatsappData {
    wamid: string,
    from: string,
    text: string,
    phoneId: string,
    tipo?: 'texto' | 'imagen' | 'documento',
    mediaId?: string | null,
    mediaUrl?: string | null,
    mimeType?: string | null,
    caption?: string | null,
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

        if (!negocio.activo) {
            throw new Error('Negocio inactivo.');
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
        let conversacionActiva = await this.conversacionRepository.buscarActivaYEscalada(cliente.id, negocio.id);
        
        if (!conversacionActiva) {
            const crearConversacion = await this.conversacionRepository.crear({
                negocioId: negocio.id,
                clienteId: cliente.id
            });
            conversacionActiva = crearConversacion;

            const menuUseCase = new GetMenuUseCase(this.negocioRepository)
            const menu = await menuUseCase.execute(data.phoneId);

            if (menu) {
                const caption = `Bienvenido a ${negocio.nombre}! Este es nuestro menú. ¿Qué deseas pedir?`
                if (menu.tipomenu === 'link') {
                    await enviarMensaje(data.from, `Bienvenido a ${negocio.nombre}! Aquí nuestro menú: nia-two.vercel.app/menu/${menu.menu_link}`, data.phoneId);
                }
                else if (menu.tipomenu === 'pdf') {
                    await pdfwhatsapp({
                        phoneId: data.phoneId,
                        to: data.from,
                        documentUrl: menu.menupdf,
                        filename: `menu-${negocio.nombre}.pdf`,
                        caption: caption
                    });
                }
                else if (menu.tipomenu === 'foto') {
                    const fotosNegocioRepo  = new FotosNegocioRepository()
                    const obtenerFotosMenuUseCase = new ObtenerFotosMenuUseCase(fotosNegocioRepo);
                    const fotos = await obtenerFotosMenuUseCase.execute(negocio.id);
                    
                    for (const foto of fotos) {
                        await imgwhatsapp({
                            phoneId: data.phoneId,
                            to: data.from,
                            imageUrl: foto.linkFoto
                        });
                        // Pequeña pausa para evitar que WhatsApp entregue las fotos fuera de orden.
                        await esperar(800);
                    }
                    // Pausa extra antes de que el webhook envíe el saludo automático.
                    await esperar(2500);
                }
            }
        }
        const conversacionActualizada = await this.conversacionRepository.actualizar(conversacionActiva.id, {
            ultimoMensajeEn: new Date()
        });

        if (conversacionActualizada) {
            conversacionActiva = conversacionActualizada;
        }

        const guardarMensaje = await this.mensajeRepository.crear({
            conversacionId: conversacionActiva.id,
            rol: 'cliente',
            contenido: data.text,
            wamid: data.wamid,
            tipo: data.tipo,
            mediaId: data.mediaId,
            mediaUrl: data.mediaUrl,
            mimeType: data.mimeType,
            caption: data.caption,
        }, negocio.id);

        return {
            negocio,
            cliente,
            conversacion: conversacionActiva,
            mensaje: guardarMensaje
        };
    }
}
