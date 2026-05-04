import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db';
import authRoutes from './infraestructure/http/routes/auth.routes';
import profesionalRoutes from './infraestructure/http/routes/ProfesionalRoutes';
import serviciosRoutes from './infraestructure/http/routes/ServiciosRoutes';
import whatsappWebhook from './webhooks/whatsapp';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/profesionales', profesionalRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/webhook', whatsappWebhook);

// Ruta de salud â€” para verificar que el servidor funciona
app.get('/health', async (req, res) => {
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
