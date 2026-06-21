import { Router } from 'express';
import { MenuController } from '../../controllers/MenuController';
import { MenuPublicoRepository } from '../../../repositories/MenuRepository';

const router = Router();

const menuPublicoRepository = new MenuPublicoRepository();
const controller = new MenuController(menuPublicoRepository);

router.get('/:slug', controller.ObtenerMenuPublico);

export default router;