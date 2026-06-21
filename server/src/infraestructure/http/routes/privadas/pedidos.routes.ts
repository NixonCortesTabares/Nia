import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { PedidoController } from '../../controllers/PedidoController';
import { PedidoRepository } from '../../../repositories/PedidoRepository';
import { PedidoProductoRepository } from '../../../repositories/PedidoProductoRepository';
import { PedidoProductoExtraRepository } from '../../../repositories/PedidoProductoExtraRepository';

const router = Router();

const pedidoRepository = new PedidoRepository();
const pedidoProdRepo = new PedidoProductoRepository();
const pedProdExtraRepo = new PedidoProductoExtraRepository();
const controller = new PedidoController(pedidoRepository, pedidoProdRepo, pedProdExtraRepo);

router.get('/', authMiddleware, controller.ListarPedidosPorNegocio);
/*
GET /api/pedidos?estado=pendiente
GET /api/pedidos?rango=7d
GET /api/pedidos?estado=en%20cocina&rango=30d
GET /api/pedidos?desde=2026-06-01&hasta=2026-06-20
*/ 
router.get('/:id', authMiddleware, controller.MostrarInfoPedido);
router.patch('/:id/estado', authMiddleware, controller.ActualizarEstadoPedido);
router.patch('/:id/cancelar', authMiddleware, controller.CancelarPedido);

export default router;