import { Request, Response } from 'express';
import { IPedidoRepository } from '../../../domain/repositories/IPedidoRepository';
import { ListarPedidosUseCase } from '../../../application/pedidos/ListarPedidosUseCase';
import { ObtenerDetallePedidoUseCase } from '../../../application/pedidos/ObtenerDetallePedidoUseCase';
import { IPedidoProductoRepository } from '../../../domain/repositories/IPedidoProductoRepository';
import { IPedidoProductoExtraRepository } from '../../../domain/repositories/IPedidoProductoExtraRepository';
import { CambiarEstadoPedidoUseCase } from '../../../application/pedidos/CambiarEstadoPedidoUseCase';
import { EnviarMensajeEstadoPedidoActualizadoUseCase } from '../../../application/conversaciones/EnviarMensajeEstadoPedidoActualizadoUseCase';
import { INegocioRepository } from '../../../domain/repositories/INegocioRepository';
import { IClienteRepository } from '../../../domain/repositories/IClienteRepository';
import { IConversacionRepository } from '../../../domain/repositories/IConversacionRepository';

export class PedidoController {
    constructor(private pedidoRepository: IPedidoRepository, private pedidoProductoRepo: IPedidoProductoRepository,
        private pedidoProdExtraRepo: IPedidoProductoExtraRepository, private negocioRepo: INegocioRepository,
        private clienteRepo: IClienteRepository, private conversacionRepo: IConversacionRepository ) { }

    ListarPedidosPorNegocio = async (req: Request, res: Response) => {
        try {
            if (!req.user?.negocioId) {
                return res.status(401).json({
                    ok: false,
                    mensaje: 'Usuario no autenticado.',
                });
            }

            const estadosPermitidos = [
                'pendiente',
                'en_cocina',
                'en_ruta',
                'entregado',
                'cancelado',
            ];

            const rangosPermitidos = ['hoy', '7d', '30d', 'mes'];

            const estado =
                typeof req.query.estado === 'string'
                    ? req.query.estado.toLowerCase()
                    : undefined;

            if (estado && !estadosPermitidos.includes(estado)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Estado de pedido no válido.',
                });
            }

            const rango =
                typeof req.query.rango === 'string'
                    ? req.query.rango.toLowerCase()
                    : undefined;

            if (rango && !rangosPermitidos.includes(rango)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Rango no válido. Usa hoy, 7d, 30d o mes.',
                });
            }

            const desde =
                typeof req.query.desde === 'string'
                    ? req.query.desde
                    : undefined;

            const hasta =
                typeof req.query.hasta === 'string'
                    ? req.query.hasta
                    : undefined;

            const limitRaw = Number(req.query.limit ?? 50);
            const offsetRaw = Number(req.query.offset ?? 0);

            const limit = Number.isFinite(limitRaw)
                ? Math.min(Math.max(limitRaw, 1), 100)
                : 50;

            const offset = Number.isFinite(offsetRaw)
                ? Math.max(offsetRaw, 0)
                : 0;

            const listarPedidosUseCase = new ListarPedidosUseCase(
                this.pedidoRepository
            );

            const pedidos = await listarPedidosUseCase.execute({
                negocioId: req.user.negocioId,
                estado,
                rango,
                desde,
                hasta,
                limit,
                offset,
            });

            return res.status(200).json({
                ok: true,
                mensaje: 'Pedidos obtenidos exitosamente.',
                pedidos,
            });
        } catch (error) {
            console.error('Error obteniendo pedidos:', error);

            return res.status(500).json({
                ok: false,
                mensaje:
                    error instanceof Error
                        ? error.message
                        : 'Error interno obteniendo pedidos.',
            });
        }
    };

    MostrarInfoPedido = async (req: Request, res: Response) => {
        try {
            if (!req.user?.negocioId) {
                return res.status(401).json({
                    ok: false,
                    mensaje: 'Usuario no autenticado.',
                });
            }

            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Falta el id del pedido.',
                });
            }

            const buscarPedidoUseCase = new ObtenerDetallePedidoUseCase(this.pedidoRepository, this.pedidoProductoRepo,
                this.pedidoProdExtraRepo);

            const pedido = await buscarPedidoUseCase.execute({
                pedidoId: id,
                negocioId: req.user.negocioId,
            });

            if (!pedido) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'Pedido no encontrado.',
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: 'Pedido obtenido exitosamente.',
                pedido,
            });
        } catch (error) {
            console.error('Error obteniendo pedido:', error);

            return res.status(500).json({
                ok: false,
                mensaje: error instanceof Error
                    ? error.message
                    : 'Error interno obteniendo pedido.',
            });
        }
    };

    ActualizarEstadoPedido = async (req: Request, res: Response) => {
        try {
            if (!req.user?.negocioId) {
                return res.status(401).json({
                    ok: false,
                    mensaje: 'Usuario no autenticado.',
                });
            }

            const { id } = req.params;
            const { estado } = req.body;

            if (!id) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Falta el id del pedido.',
                });
            }

            if (!estado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Falta el estado del pedido.',
                });
            }

            const estadosPermitidos = [
                'pendiente',
                'en_cocina',
                'en_ruta',
                'entregado',
                'cancelado',
            ];

            if (!estadosPermitidos.includes(estado)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Estado de pedido no válido.',
                });
            }

            const actualizarEstadoUseCase = new CambiarEstadoPedidoUseCase(
                this.pedidoRepository
            );

            const pedido = await actualizarEstadoUseCase.execute({
                pedidoId: id,
                negocioId: req.user.negocioId,
                estado,
            });

            if (!pedido) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'Pedido no encontrado.',
                });
            }

            //const enviarMenEstPedActu = new EnviarMensajeEstadoPedidoActualizadoUseCase(this.negocioRepo, this.pedidoRepository, this.clienteRepo, this.conversacionRepo);

           // await enviarMenEstPedActu.execute(estado, id, req.user.negocioId);

            return res.status(200).json({
                ok: true,
                mensaje: 'Estado del pedido actualizado exitosamente.',
                pedido,
            });
        } catch (error) {
            console.error('Error actualizando estado del pedido:', error);

            return res.status(500).json({
                ok: false,
                mensaje: error instanceof Error
                    ? error.message
                    : 'Error interno actualizando estado del pedido.',
            });
        }
    };

    CancelarPedido = async (req: Request, res: Response) => {
        try {
            if (!req.user?.negocioId) {
                return res.status(401).json({
                    ok: false,
                    mensaje: 'Usuario no autenticado.',
                });
            }

            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Falta el id del pedido.',
                });
            }

            const cambiarEstadoPedidoUseCase = new CambiarEstadoPedidoUseCase(
                this.pedidoRepository
            );

            const pedido = await cambiarEstadoPedidoUseCase.execute({
                pedidoId: id,
                negocioId: req.user.negocioId,
                estado: 'cancelado',
            });

            if (!pedido) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'Pedido no encontrado.',
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: 'Pedido cancelado exitosamente.',
                pedido,
            });
        } catch (error) {
            console.error('Error cancelando pedido:', error);

            return res.status(500).json({
                ok: false,
                mensaje: error instanceof Error
                    ? error.message
                    : 'Error interno cancelando pedido.',
            });
        }
    };
}