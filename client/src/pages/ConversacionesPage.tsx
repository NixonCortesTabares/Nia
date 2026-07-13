import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  obtenerConversacionPorId,
  obtenerConversaciones,
  tomarControlConversacion,
  type ConversacionDetalle,
  type ConversacionResumen,
} from '../api/conversacionesApi'
import {
  enviarMensajeManual,
  obtenerMensajesConversacion,
  type MensajeConversacion,
} from '../api/mensajesApi'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import type { DashboardEvent } from '../hooks/useDashboardRealtime'

const estadoLabel: Record<string, string> = {
  activa: 'Activa',
  escalada: 'Atencion humana',
  resuelta: 'Resuelta',
}

function formatFecha(value?: string | null) {
  if (!value) {
    return 'Sin actividad'
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatFechaLista(value?: string | null) {
  if (!value) {
    return ''
  }

  const fecha = new Date(value)
  const hoy = new Date()
  const mismoDia = fecha.toDateString() === hoy.toDateString()

  return new Intl.DateTimeFormat('es-CO', mismoDia
    ? { hour: 'numeric', minute: '2-digit' }
    : { day: '2-digit', month: '2-digit', year: fecha.getFullYear() === hoy.getFullYear() ? undefined : '2-digit' }
  ).format(fecha)
}

export function ConversacionesPage() {
  const [conversaciones, setConversaciones] = useState<ConversacionResumen[]>([])
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null)
  const [detalle, setDetalle] = useState<ConversacionDetalle | null>(null)
  const [mensajes, setMensajes] = useState<MensajeConversacion[]>([])
  const [contenido, setContenido] = useState('')
  const [loadingInicial, setLoadingInicial] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mostrandoDetalleMobile, setMostrandoDetalleMobile] = useState(false)
  const [conversacionesPorAtender, setConversacionesPorAtender] = useState<Set<string>>(new Set())
  const requestEnCursoRef = useRef(false)
  const seleccionadaIdRef = useRef<string | null>(null)
  const refetchConversacionesTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    seleccionadaIdRef.current = seleccionadaId
  }, [seleccionadaId])

  const conversacionSeleccionada = useMemo(
    () => conversaciones.find((item) => item.id === seleccionadaId) ?? null,
    [conversaciones, seleccionadaId]
  )

  const cargarDatos = useCallback(async (silent = false) => {
    if (requestEnCursoRef.current) {
      return
    }

    requestEnCursoRef.current = true

    try {
      if (!silent) {
        setError(null)
      }

      const conversacionesResponse = await obtenerConversaciones()
      const nuevasConversaciones = conversacionesResponse.conversaciones
      setConversaciones(nuevasConversaciones)

      const conversacionesAbiertas = JSON.parse(
        window.localStorage.getItem('nia-conversaciones-escaladas-abiertas') ?? '[]'
      ) as string[]
      setConversacionesPorAtender(new Set(
        nuevasConversaciones
          .filter((item) => item.estado === 'escalada' && !conversacionesAbiertas.includes(item.id))
          .map((item) => item.id)
      ))

      const idActual = seleccionadaIdRef.current
      const idSeleccion = idActual && nuevasConversaciones.some((item) => item.id === idActual)
        ? idActual
        : nuevasConversaciones[0]?.id ?? null

      setSeleccionadaId(idSeleccion)
      seleccionadaIdRef.current = idSeleccion

      if (idSeleccion) {
        const [detalleResponse, mensajesResponse] = await Promise.all([
          obtenerConversacionPorId(idSeleccion),
          obtenerMensajesConversacion(idSeleccion),
        ])

        setDetalle(detalleResponse.conversacion)
        setMensajes(mensajesResponse.mensajes)
      } else {
        setDetalle(null)
        setMensajes([])
      }
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las conversaciones.')
      }
    } finally {
      setLoadingInicial(false)
      requestEnCursoRef.current = false
    }
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  useEffect(() => {
    const handler = (event: Event) => {
      const dashboardEvent = (event as CustomEvent<DashboardEvent>).detail

      console.log('[ConversacionesPage] Evento global recibido:', dashboardEvent)

      if (
        dashboardEvent.type !== 'mensaje_nuevo'
        && dashboardEvent.type !== 'conversacion_nueva'
        && dashboardEvent.type !== 'conversacion_actualizada'
        && dashboardEvent.type !== 'conversacion_escalada'
      ) {
        return
      }

      console.log('[ConversacionesPage] Refetch por evento:', dashboardEvent)

      if (refetchConversacionesTimeoutRef.current) window.clearTimeout(refetchConversacionesTimeoutRef.current)
      refetchConversacionesTimeoutRef.current = window.setTimeout(() => void cargarDatos(true), 500)
    }

    window.addEventListener('nia:dashboard-event', handler)

    return () => {
      window.removeEventListener('nia:dashboard-event', handler)

      if (refetchConversacionesTimeoutRef.current) {
        window.clearTimeout(refetchConversacionesTimeoutRef.current)
      }
    }
  }, [cargarDatos])

  async function seleccionarConversacion(id: string) {
    if (requestEnCursoRef.current) {
      return
    }

    requestEnCursoRef.current = true
    setSeleccionadaId(id)
    seleccionadaIdRef.current = id
    setMostrandoDetalleMobile(true)
    const abiertas = JSON.parse(
      window.localStorage.getItem('nia-conversaciones-escaladas-abiertas') ?? '[]'
    ) as string[]
    const conversacionAbierta = conversaciones.find((item) => item.id === id)
    if (conversacionAbierta?.estado === 'escalada' && !abiertas.includes(id)) {
      window.localStorage.setItem(
        'nia-conversaciones-escaladas-abiertas',
        JSON.stringify([...abiertas, id])
      )
      window.dispatchEvent(new Event('nia:conversacion-abierta'))
    }
    setConversacionesPorAtender((current) => {
      if (!current.has(id)) {
        return current
      }
      const next = new Set(current)
      next.delete(id)
      return next
    })
    setError(null)

    try {
      const [detalleResponse, mensajesResponse] = await Promise.all([
        obtenerConversacionPorId(id),
        obtenerMensajesConversacion(id),
      ])

      setDetalle(detalleResponse.conversacion)
      setMensajes(mensajesResponse.mensajes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo abrir la conversacion.')
    } finally {
      requestEnCursoRef.current = false
    }
  }

  async function tomarControl() {
    if (!seleccionadaId) {
      return
    }

    try {
      setError(null)
      const response = await tomarControlConversacion(seleccionadaId)
      setDetalle(response.conversacion)
      setConversaciones((current) =>
        current.map((item) =>
          item.id === seleccionadaId
            ? { ...item, estado: response.conversacion.estado }
            : item
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo tomar el control.')
    }
  }

  async function enviarMensaje(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!seleccionadaId || !contenido.trim() || enviando) {
      return
    }

    try {
      setEnviando(true)
      setError(null)
      const response = await enviarMensajeManual(seleccionadaId, contenido)
      setMensajes((current) => [...current, response.resultado])
      setContenido('')
      cargarDatos(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje.')
    } finally {
      setEnviando(false)
    }
  }

  const estadoActual = detalle?.estado ?? conversacionSeleccionada?.estado
  const estaEscalada = estadoActual === 'escalada'
  const conversacionesOrdenadas = useMemo(
    () => [...conversaciones].sort((a, b) => {
      if (a.estado === 'escalada' && b.estado !== 'escalada') return -1
      if (a.estado !== 'escalada' && b.estado === 'escalada') return 1
      return new Date(b.ultimaActividadEn ?? b.creadoEn).getTime()
        - new Date(a.ultimaActividadEn ?? a.creadoEn).getTime()
    }),
    [conversaciones]
  )

  return (
    <div className={`conversations-layout ${mostrandoDetalleMobile ? 'mobile-detail-open' : ''}`}>
      <Card className="conversation-list-panel">
        <div className="section-header">
          <div>
            <h2>Conversaciones</h2>
            <small>{conversaciones.length} conversaciones</small>
          </div>
        </div>

        {loadingInicial ? <p>Cargando conversaciones...</p> : null}
        {error ? <div className="success-message">{error}</div> : null}

        <div className="conversation-list">
          {conversacionesOrdenadas.map((conversacion) => (
            <button
              key={conversacion.id}
              className={`conversation-item ${conversacion.id === seleccionadaId ? 'selected' : ''} ${conversacionesPorAtender.has(conversacion.id) ? 'needs-attention' : ''}`}
              type="button"
              onClick={() => seleccionarConversacion(conversacion.id)}
            >
              <span className="conversation-item-top">
                <strong>{conversacion.cliente.nombre || 'Cliente sin nombre'}</strong>
                <time>{formatFechaLista(conversacion.ultimaActividadEn)}</time>
              </span>
              <span className="conversation-item-bottom">
                <small>{conversacion.ultimoMensaje || 'Sin mensajes todavia'}</small>
                <Badge tone={conversacion.estado === 'escalada' ? 'warning' : 'neutral'}>
                  {estadoLabel[conversacion.estado] ?? conversacion.estado}
                </Badge>
              </span>
            </button>
          ))}

          {!loadingInicial && conversaciones.length === 0 ? (
            <p>No hay conversaciones todavia.</p>
          ) : null}
        </div>
      </Card>

      <Card className="conversation-detail-panel">
        {seleccionadaId ? (
          <>
            <div className="conversation-detail-header">
              <button
                className="conversation-back-button"
                type="button"
                aria-label="Volver a conversaciones"
                onClick={() => setMostrandoDetalleMobile(false)}
              >
                ←
              </button>
              <div>
                <h2>{conversacionSeleccionada?.cliente.nombre || 'Cliente sin nombre'}</h2>
                <small>{conversacionSeleccionada?.cliente.telefono || 'Sin telefono'}</small>
              </div>
              {estadoActual ? (
                <Badge tone={estaEscalada ? 'warning' : 'neutral'}>
                  {estadoLabel[estadoActual] ?? estadoActual}
                </Badge>
              ) : null}
            </div>

            <div className="conversation-actions">
              {estadoActual === 'activa' ? (
                <Button variant="primary" onClick={tomarControl}>
                  Tomar el control
                </Button>
              ) : null}

              {estaEscalada ? (
                <p>Conversacion en atencion humana</p>
              ) : (
                <p>Para responder manualmente, primero debes tomar el control de la conversacion.</p>
              )}
            </div>

            <div className="messages-panel">
              {mensajes.map((mensaje) => (
                <div
                  key={mensaje.id}
                  className={`message-bubble ${mensaje.origen === 'cliente' ? 'incoming' : 'outgoing'}`}
                >
                  {mensaje.tipo === 'imagen' && mensaje.mediaUrl ? (
                    <a href={mensaje.mediaUrl} target="_blank" rel="noreferrer">
                      <img
                        src={mensaje.mediaUrl}
                        alt="Comprobante de transferencia"
                        className="max-w-xs rounded-lg border object-cover"
                      />
                    </a>
                  ) : null}
                  {mensaje.tipo === 'documento' && mensaje.mediaUrl ? (
                    <a
                      href={mensaje.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      Ver comprobante adjunto
                    </a>
                  ) : null}
                  {(mensaje.tipo === 'imagen' || mensaje.tipo === 'documento') && !mensaje.mediaUrl ? (
                    <p className="text-sm text-red-600">
                      El cliente envio un archivo, pero no se pudo cargar.
                    </p>
                  ) : null}
                  {mensaje.tipo === 'texto' || !mensaje.tipo || mensaje.mediaUrl ? (
                    <p>{mensaje.caption ?? mensaje.contenido}</p>
                  ) : null}
                  <small>{formatFecha(mensaje.creadoEn)}</small>
                </div>
              ))}

              {mensajes.length === 0 ? <p>No hay mensajes en esta conversacion.</p> : null}
            </div>

            {estaEscalada ? (
              <form className="message-composer" onSubmit={enviarMensaje}>
                <textarea
                  value={contenido}
                  onChange={(event) => setContenido(event.target.value)}
                  placeholder="Escribe tu respuesta"
                  rows={3}
                />
                <Button variant="primary" disabled={enviando || !contenido.trim()}>
                  Enviar
                </Button>
              </form>
            ) : null}
          </>
        ) : (
          <p>Selecciona una conversacion para ver los mensajes.</p>
        )}
      </Card>
    </div>
  )
}
