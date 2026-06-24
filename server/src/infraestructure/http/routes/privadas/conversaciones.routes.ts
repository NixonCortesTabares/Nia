import { Router } from 'express';
import { ConversacionRepository } from '../../../repositories/ConversacionRepository';
import { ConversacionController } from '../../controllers/ConversacionController';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

const conversacionRepository = new ConversacionRepository();
const controller = new ConversacionController(conversacionRepository);

router.get('/', authMiddleware, (req, res) =>
  controller.ListarConversaciones(req, res)
);

router.get('/:id', authMiddleware, (req, res) =>
  controller.ObtenerConversacion(req, res)
);

router.patch('/:id/tomar-control', authMiddleware, (req, res) =>
  controller.TomarControl(req, res)
);

export default router;
