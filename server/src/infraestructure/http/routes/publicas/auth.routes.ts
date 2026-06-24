import { Router } from 'express';
import { AuthController } from '../../controllers/AuthController';
import { UsuarioRepository } from '../../../repositories/UsuarioRepository';
import { NegocioRepository } from '../../../repositories/NegocioRepository';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { enviarMensaje } from '../../../../agent/whatsapp';

const router = Router();
const usuarioRepo = new UsuarioRepository();
const negocioRepo = new NegocioRepository();

const controller = new AuthController(usuarioRepo, negocioRepo);

router.post('/register', (req, res) => controller.register(req, res));
router.post('/login', (req, res) => controller.login(req, res));
router.post('/crearUsuario', authMiddleware, (req, res) => controller.crearUsuario(req, res))

export default router;
