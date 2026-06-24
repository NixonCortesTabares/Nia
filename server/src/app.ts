import express, { Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db';
import authRoutes from './infraestructure/http/routes/publicas/auth.routes';
import whatsappWebhook from './webhooks/whatsapp';
import { startAgentWorker } from './agent/agentWorker';
import productRoutes from './infraestructure/http/routes/privadas/productos.routes';
import pedidosRoutes from './infraestructure/http/routes/privadas/pedidos.routes';
import categoriasRoutes from './infraestructure/http/routes/privadas/categorias.routes';
import negociosRoutes from './infraestructure/http/routes/privadas/negocios.routes';
import extrasRoutes from './infraestructure/http/routes/privadas/extras.routes';
import menuRoutes from './infraestructure/http/routes/publicas/menu.routes';
import mensajesRoutes from './infraestructure/http/routes/privadas/mensajes.routes';
import conversacionesRoutes from './infraestructure/http/routes/privadas/conversaciones.routes';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://nia-two.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'ngrok-skip-browser-warning',
  ],
}));
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/webhook', whatsappWebhook);
apiRouter.use('/productos', productRoutes);
apiRouter.use('/pedidos', pedidosRoutes);
apiRouter.use('/categorias', categoriasRoutes);
apiRouter.use('/negocios', negociosRoutes);
apiRouter.use('/extras', extrasRoutes)
apiRouter.use('/menu', menuRoutes)
apiRouter.use('/mensajes', mensajesRoutes);
apiRouter.use('/conversaciones', conversacionesRoutes);
app.use('/api', apiRouter);

startAgentWorker();

// Ruta de salud â€” para verificar que el servidor funciona
apiRouter.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      message: 'Servidor y base de datos funcionando',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error conectando a la base de datos',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
