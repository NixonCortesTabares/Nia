import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { NegocioController } from '../../controllers/NegocioController';
import { NegocioRepository } from '../../../repositories/NegocioRepository';

const router = Router();

const negocioRepo = new NegocioRepository();
const controller = new NegocioController(negocioRepo);

router.get('/me', authMiddleware, controller.ObtenerMiNegocio);
router.patch('/me', authMiddleware, controller.ActualizarMiNegocio);
//router.patch('/me/menu', authMiddleware, controller.ActualizarConfigMenu);

export default router;