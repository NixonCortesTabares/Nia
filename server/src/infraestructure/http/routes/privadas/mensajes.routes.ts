import { Router } from 'express';
import { ClienteRepository } from '../../../repositories/ClienteRepository';
import { ConversacionRepository } from '../../../repositories/ConversacionRepository';
import { MensajeRepository } from '../../../repositories/MensajeRepository';
import { NegocioRepository } from '../../../repositories/NegocioRepository';
import { MensajeController } from '../../controllers/MensajeController';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

const conversacionRepository = new ConversacionRepository();
const mensajeRepository = new MensajeRepository();
const negocioRepository = new NegocioRepository();
const clienteRepository = new ClienteRepository();

const controller = new MensajeController(
  conversacionRepository,
  mensajeRepository,
  negocioRepository,
  clienteRepository
);

router.get('/conversacion/:conversacionId', authMiddleware, (req, res) =>
  controller.ListarPorConversacion(req, res)
);

router.post('/conversacion/:conversacionId/manual', authMiddleware, (req, res) =>
  controller.EnviarManual(req, res)
);

export default router;
