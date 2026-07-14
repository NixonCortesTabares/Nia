import { Router } from 'express';
import {
  eliminarClienteSSE,
  emitirEventoDashboard,
  registrarClienteSSE,
} from '../../../realtime/sseHub';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  const negocioId = req.user?.negocioId;
  if (!negocioId) {
    res.status(401).json({ ok: false, message: 'No autorizado.' });
    return;
  }

  const clientId = typeof req.query.clientId === 'string'
    ? req.query.clientId
    : 'sin-client-id';

  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const cliente = registrarClienteSSE({
    negocioId,
    clientId,
    response: res,
  });

  res.write('retry: 5000\n\n');
  res.write('event: conectado\n');
  res.write(`data: ${JSON.stringify({ type: 'conectado', ok: true, clientId })}\n\n`);
  (res as unknown as { flush?: () => void }).flush?.();

  const heartbeat = setInterval(() => {
    if (res.destroyed || res.writableEnded) {
      clearInterval(heartbeat);
      return;
    }

    res.write('event: ping\n');
    res.write(`data: ${JSON.stringify({
      type: 'ping',
      now: new Date().toISOString(),
      clientId,
    })}\n\n`);
    (res as unknown as { flush?: () => void }).flush?.();

    console.log('[SSE Local] Ping enviado:', {
      negocioId,
      clientId,
      destroyed: res.destroyed,
      writableEnded: res.writableEnded,
    });
  }, 10000);

  let cleanedUp = false;

  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;

    clearInterval(heartbeat);
    eliminarClienteSSE({ negocioId, cliente });

    console.log('[SSE Local] Conexión eliminada:', {
      negocioId,
      clientId,
    });
  };

  req.on('close', cleanup);
  res.on('close', cleanup);
  res.on('error', cleanup);
});

if (process.env.NODE_ENV !== 'production') {
  router.post('/debug/pedido-nuevo', authMiddleware, (req, res) => {
    const negocioId = req.user?.negocioId;

    if (!negocioId) {
      res.status(401).json({ ok: false, message: 'No autorizado.' });
      return;
    }

    const pedidoId = crypto.randomUUID();
    const evento = {
      type: 'pedido_nuevo' as const,
      negocioId,
      pedidoId,
    };

    emitirEventoDashboard(evento);

    res.json({
      ok: true,
      evento,
    });
  });
}

export default router;
