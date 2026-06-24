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

const POLLING_INTERVAL_MS = 3000

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

export function ConversacionesPage() {
  const [conversaciones, setConversaciones] = useState<ConversacionResumen[]>([])
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null)
  const [detalle, setDetalle] = useState<ConversacionDetalle | null>(null)
  const [mensajes, setMensajes] = useState<MensajeConversacion[]>([])
  const [contenido, setContenido] = useState('')
  const [loadingInicial, setLoadingInicial] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestEnCursoRef = useRef(false)
  const seleccionadaIdRef = useRef<string | null>(null)

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
    const intervalId = window.setInterval(() => {
      cargarDatos(true)
    }, POLLING_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [cargarDatos])

  async function seleccionarConversacion(id: string) {
    if (requestEnCursoRef.current) {
      return
    }

    requestEnCursoRef.current = true
    setSeleccionadaId(id)
    seleccionadaIdRef.current = id
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

  return (
    <div className="conversations-layout">
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
          {conversaciones.map((conversacion) => (
            <button
              key={conversacion.id}
              className={`conversation-item ${conversacion.id === seleccionadaId ? 'selected' : ''}`}
              type="button"
              onClick={() => seleccionarConversacion(conversacion.id)}
            >
              <span className="conversation-item-top">
                <strong>{conversacion.cliente.nombre || 'Cliente sin nombre'}</strong>
                <Badge tone={conversacion.estado === 'escalada' ? 'warning' : 'neutral'}>
                  {estadoLabel[conversacion.estado] ?? conversacion.estado}
                </Badge>
              </span>
              <span>{conversacion.cliente.telefono || 'Sin telefono'}</span>
              <small>{conversacion.ultimoMensaje || 'Sin mensajes todavia'}</small>
              <small>{formatFecha(conversacion.ultimaActividadEn)}</small>
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
                  <p>{mensaje.contenido}</p>
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
