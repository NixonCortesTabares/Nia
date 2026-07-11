import { Response } from 'express';

export type DashboardEventType =
  | 'mensaje_nuevo'
  | 'conversacion_nueva'
  | 'conversacion_actualizada'
  | 'pedido_nuevo'
  | 'pedido_actualizado'
  | 'conversacion_escalada';

export type DashboardEvent = {
  type: DashboardEventType;
  negocioId: string;
  conversacionId?: string;
  pedidoId?: string;
};

const clientesPorNegocio = new Map<string, Set<Response>>();

export function registrarClienteSSE(negocioId: string, res: Response): void {
  let clientes = clientesPorNegocio.get(negocioId);
  if (!clientes) {
    clientes = new Set<Response>();
    clientesPorNegocio.set(negocioId, clientes);
  }
  clientes.add(res);

  res.on('close', () => {
    clientes?.delete(res);
    if (clientes?.size === 0) clientesPorNegocio.delete(negocioId);
  });
}

export function emitirEventoDashboard(evento: DashboardEvent): void {
  const clientes = clientesPorNegocio.get(evento.negocioId);
  if (!clientes?.size) return;

  const data = JSON.stringify(evento);
  for (const res of clientes) {
    try {
      res.write(`event: ${evento.type}\n`);
      res.write(`data: ${data}\n\n`);
    } catch (error) {
      clientes.delete(res);
      console.error('Error emitiendo evento SSE:', error);
    }
  }
  if (clientes.size === 0) clientesPorNegocio.delete(evento.negocioId);
}
