import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { ProductoController } from "../../controllers/ProductoController";
import { ProductoRepository } from "../../../repositories/ProductoRepository";
import { CategoriaRepository } from "../../../repositories/CategoriaRepository";

const router = Router();
const productoRepo = new ProductoRepository();
const categoriaRepo = new CategoriaRepository();
const controller = new ProductoController(productoRepo, categoriaRepo);
router.get('/', authMiddleware, (req, res) => controller.ObtenerProductosPorNegocio(req,res));
router.patch('/:id', authMiddleware, (req, res) => controller.ActualizarProducto(req, res));
router.post('/', authMiddleware, (req, res) => controller.CrearProducto(req, res));
router.get('/:id', authMiddleware, (req, res) => controller.MostrarInfoProducto(req, res));



export default router;