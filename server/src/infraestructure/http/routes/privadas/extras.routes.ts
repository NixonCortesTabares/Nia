import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';

import { ExtraController } from '../../controllers/ExtraController';

import { ExtraRepository } from '../../../repositories/ExtraRepository';
import { CategoriaRepository } from '../../../repositories/CategoriaRepository';
import { CategoriaExtraRepository } from '../../../repositories/CategoriaExtraRepository';

const router = Router();

const extraRepository = new ExtraRepository();
const categoriaRepository = new CategoriaRepository();
const categoriaExtraRepository = new CategoriaExtraRepository();

const controller = new ExtraController(
  extraRepository,
  categoriaRepository,
  categoriaExtraRepository
);

// Relación categoría-extra.
// Estas rutas van antes de "/:id".
router.get(
  '/categorias/:categoriaId',
  authMiddleware,
  controller.ObtenerExtrasPorCategoria
);

router.post(
  '/categorias/:categoriaId/:extraId',
  authMiddleware,
  controller.AsignarExtraACategoria
);

router.delete(
  '/categorias/:categoriaId/:extraId',
  authMiddleware,
  controller.QuitarExtraDeCategoria
);

// CRUD de extras.
router.get('/', authMiddleware, controller.ObtenerExtrasPorNegocio);
router.post('/', authMiddleware, controller.CrearExtra);
router.get('/:id', authMiddleware, controller.MostrarInfoExtra);
router.patch('/:id', authMiddleware, controller.ActualizarExtra);
router.patch('/:id/desactivar', authMiddleware, controller.DesactivarExtra);

export default router;