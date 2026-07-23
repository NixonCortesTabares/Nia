import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { EventoController } from "../../controllers/EventoController";

const router = Router();
export const controllerEventos = new EventoController();

router.get('/', authMiddleware, controllerEventos.GuardarRequest);

export default router;