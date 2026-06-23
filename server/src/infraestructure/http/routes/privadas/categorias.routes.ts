import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { CategoriaController } from '../../controllers/CategoriaController';
import { CategoriaRepository } from '../../../repositories/CategoriaRepository';

const router = Router();

const categoriaRepository = new CategoriaRepository();
const controller = new CategoriaController(categoriaRepository);

router.get('/', authMiddleware, controller.ObtenerCategoriasPorNegocio);
router.post('/', authMiddleware, controller.CrearCategoria);
router.get('/:id', authMiddleware, controller.MostrarInfoCategoria);
router.patch('/:id', authMiddleware, controller.ActualizarCategoria);
export default router;