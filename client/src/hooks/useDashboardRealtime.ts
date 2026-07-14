import { useEffect, useRef } from 'react'
import { fetchEventSource } from '@microsoft/fetch-event-source'

type DashboardEventType =
  | 'mensaje_nuevo'
  | 'conversacion_nueva'
  | 'conversacion_actualizada'
  | 'pedido_nuevo'
  | 'pedido_actualizado'
  | 'conversacion_escalada'

export type DashboardEvent = {
  type: DashboardEventType
  negocioId: string
  conversacionId?: string
  pedidoId?: string
}

type UseDashboardRealtimeParams = {
  onMensajeNuevo?: (evento: DashboardEvent) => void
  onPedidoNuevo?: (evento: DashboardEvent) => void
  onConversacionEscalada?: (evento: DashboardEvent) => void
  onEvento?: (evento: DashboardEvent) => void
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export function useDashboardRealtime(params: UseDashboardRealtimeParams) {
  const paramsRef = useRef(params)

  useEffect(() => {
    paramsRef.current = params
  }, [params])

  useEffect(() => {
    console.log('[Realtime] useEffect ejecutado')

    const token = window.localStorage.getItem('token')

    console.log('[Realtime] token encontrado:', Boolean(token))
    console.log('[Realtime] API_URL:', API_URL)

    if (!token) {
      console.warn('[Realtime] No se abrió conexión porque no hay token')
      return
    }

    let clientId = window.sessionStorage.getItem('nia-realtime-client-id')

    if (!clientId) {
      clientId = window.crypto.randomUUID()
      window.sessionStorage.setItem('nia-realtime-client-id', clientId)
    }

    const controller = new AbortController()
    const realtimeUrl = `${API_URL}/realtime?clientId=${encodeURIComponent(clientId)}`

    console.log('[Realtime Local] API_URL:', API_URL)
    console.log('[Realtime Local] URL final:', realtimeUrl)
    console.log('[Realtime Local] Client ID:', clientId)
    console.log('[Realtime Local] URL:', realtimeUrl)

    void fetchEventSource(realtimeUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      signal: controller.signal,
      openWhenHidden: true,

      async onopen(response) {
        console.log('[Realtime Local] Conexión abierta:', {
          status: response.status,
          contentType: response.headers.get('content-type'),
        })

        if (!response.ok) {
          console.error('No se pudo abrir conexión realtime:', response.status)
          throw new Error(`Realtime error ${response.status}`)
        }

        const contentType = response.headers.get('content-type')

        if (!contentType?.includes('text/event-stream')) {
          console.error('La respuesta realtime no es SSE:', contentType)
          throw new Error('La respuesta realtime no es text/event-stream')
        }

        console.log('[Realtime Local] Conexión abierta correctamente')
      },

      onmessage(event) {
        console.log('[Realtime Local] Evento bruto:', {
          event: event.event,
          data: event.data,
        })

        if (!event.data || event.event === 'ping' || event.event === 'conectado') return

        try {
          const data = JSON.parse(event.data) as DashboardEvent

          console.log('[Realtime Local] Evento parseado:', data)

          paramsRef.current.onEvento?.(data)

          if (
            data.type === 'mensaje_nuevo' ||
            data.type === 'conversacion_nueva' ||
            data.type === 'conversacion_actualizada'
          ) {
            paramsRef.current.onMensajeNuevo?.(data)
          }

          if (data.type === 'pedido_nuevo' || data.type === 'pedido_actualizado') {
            paramsRef.current.onPedidoNuevo?.(data)
          }

          if (data.type === 'conversacion_escalada') {
            paramsRef.current.onConversacionEscalada?.(data)
          }
        } catch (error) {
          console.error('Error parseando evento realtime:', error)
        }
      },

      onerror(error) {
        if (controller.signal.aborted) {
          console.log('[Realtime Local] Conexión cerrada manualmente')
          return
        }

        console.error('[Realtime Local] Error en conexión:', error)

        return 5000
      },
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return

      console.error('[Realtime Local] La conexión terminó:', error)
    })

    return () => controller.abort()
  }, [])
}
