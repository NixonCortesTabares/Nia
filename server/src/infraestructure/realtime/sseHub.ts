import { Response } from 'express';
import { randomUUID } from 'node:crypto';

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

export type SseClient = {
  response: Response;
  clientId: string;
  connectionId: string;
};

const clientesPorNegocio = new Map<string, Set<SseClient>>();

export function registrarClienteSSE(input: {
  negocioId: string;
  clientId: string;
  response: Response;
}): SseClient {
  const { negocioId, clientId, response } = input;
  let clientes = clientesPorNegocio.get(negocioId)

  if (!clientes) {
    clientes = new Set<SseClient>()
    clientesPorNegocio.set(negocioId, clientes)
  }

  const cliente: SseClient = {
    response,
    clientId,
    connectionId: randomUUID(),
  }

  clientes.add(cliente)

  console.log('[SSE Local] Cliente conectado:', {
    negocioId,
    clientId,
    connectionId: cliente.connectionId,
    processPid: process.pid,
    totalClientes: clientes.size,
  })

  return cliente
}

export function eliminarClienteSSE(input: {
  negocioId: string;
  cliente: SseClient;
}): void {
  const { negocioId, cliente } = input;
  const clientes = clientesPorNegocio.get(negocioId)

  if (!clientes) return

  clientes.delete(cliente)

  if (clientes.size === 0) {
    clientesPorNegocio.delete(negocioId)
  }

  console.log('[SSE Local] Cliente desconectado:', {
    negocioId,
    clientId: cliente.clientId,
    connectionId: cliente.connectionId,
    processPid: process.pid,
    totalClientes: clientes.size,
  })
}

export function emitirEventoDashboard(evento: DashboardEvent): void {
  const clientes = clientesPorNegocio.get(evento.negocioId)

  console.log('[SSE Local] Intentando emitir:', {
    evento,
    processPid: process.pid,
    clientesConectados: clientes?.size ?? 0,
  })

  if (!clientes?.size) return

  const data = JSON.stringify(evento)

  for (const cliente of [...clientes]) {
    const res = cliente.response

    if (res.destroyed || res.writableEnded) {
      console.warn('[SSE Local] Conexión inválida:', {
        clientId: cliente.clientId,
        connectionId: cliente.connectionId,
        destroyed: res.destroyed,
        writableEnded: res.writableEnded,
      })

      clientes.delete(cliente)
      continue
    }

    try {
      const eventWriteOk = res.write(`event: ${evento.type}\n`)
      const dataWriteOk = res.write(`data: ${data}\n\n`)

      ;(res as unknown as { flush?: () => void }).flush?.()

      console.log('[SSE Local] Evento escrito:', {
        type: evento.type,
        negocioId: evento.negocioId,
        clientId: cliente.clientId,
        connectionId: cliente.connectionId,
        eventWriteOk,
        dataWriteOk,
        destroyed: res.destroyed,
        writableEnded: res.writableEnded,
      })
    } catch (error) {
      console.error('[SSE Local] Error escribiendo:', {
        type: evento.type,
        clientId: cliente.clientId,
        connectionId: cliente.connectionId,
        error,
      })

      clientes.delete(cliente)
    }
  }

  if (clientes.size === 0) {
    clientesPorNegocio.delete(evento.negocioId)
  }
}
