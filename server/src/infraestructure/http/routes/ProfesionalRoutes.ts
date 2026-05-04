import { Router } from 'express';
import { ProfesionalController } from '../controllers/ProfesionalController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new ProfesionalController();

router.use(authMiddleware);

router.post('/', (req, res) => controller.crear(req, res));
router.get('/', (req, res) => controller.listar(req, res));
router.get('/:id', (req, res) => controller.obtener(req, res));
router.put('/:id', (req, res) => controller.actualizar(req, res));
router.delete('/:id', (req, res) => controller.desactivar(req, res));

export default router;
