import { Router } from 'express';
import { registrarClienteSSE } from '../../../realtime/sseHub';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  const negocioId = req.user?.negocioId;
  if (!negocioId) {
    return res.status(401).json({ ok: false, message: 'No autorizado.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
  res.write('event: conectado\n');
  res.write(`data: ${JSON.stringify({ type: 'conectado', ok: true })}\n\n`);
  registrarClienteSSE(negocioId, res);

  const heartbeat = setInterval(() => {
    res.write('event: ping\n');
    res.write(`data: ${JSON.stringify({ type: 'ping', now: new Date().toISOString() })}\n\n`);
  }, 25000);

  req.on('close', () => clearInterval(heartbeat));
});

export default router;
