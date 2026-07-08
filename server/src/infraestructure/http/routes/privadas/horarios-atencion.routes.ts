import { Router } from 'express';
import { HorarioAtencionController } from '../../controllers/HorarioAtencionController';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { HorarioAtencionRepository } from '../../../repositories/HorarioAtencionRepository';

const router = Router();

const horarioAtencionRepository = new HorarioAtencionRepository();
const controller = new HorarioAtencionController(horarioAtencionRepository);

router.get('/', authMiddleware, controller.ObtenerHorariosPorNegocio);
router.post('/', authMiddleware, controller.CrearHorario);
router.get('/:id', authMiddleware, controller.MostrarInfoHorario);
router.patch('/:id', authMiddleware, controller.ActualizarHorario);
router.delete('/:id', authMiddleware, controller.EliminarHorario);

export default router;
