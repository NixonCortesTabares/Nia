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
    const token = window.localStorage.getItem('token')
    if (!token) return

    const controller = new AbortController()

    void fetchEventSource(`${API_URL}/realtime`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      signal: controller.signal,
      openWhenHidden: true,
      onmessage(event) {
        if (!event.data || event.event === 'ping' || event.event === 'conectado') return

        try {
          const data = JSON.parse(event.data) as DashboardEvent
          paramsRef.current.onEvento?.(data)

          if (data.type === 'mensaje_nuevo' || data.type === 'conversacion_nueva' || data.type === 'conversacion_actualizada') {
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
        console.error('Error en conexión realtime:', error)
        throw error
      },
    })

    return () => controller.abort()
  }, [])
}
