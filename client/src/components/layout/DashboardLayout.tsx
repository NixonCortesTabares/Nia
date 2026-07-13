import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { obtenerConversaciones } from '../../api/conversacionesApi'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { MobileBottomNav } from './MobileBottomNav'
import { useDashboardRealtime } from '../../hooks/useDashboardRealtime'

export function DashboardLayout({ title, children }: { title: string; children: ReactNode }) {
  const [conversacionesPendientes, setConversacionesPendientes] = useState(0)
  const pendientesGuardadas = window.sessionStorage.getItem('nia-conversaciones-pendientes-detectadas')
  const pendientesAnterioresRef = useRef<Set<string> | null>(
    pendientesGuardadas ? new Set(JSON.parse(pendientesGuardadas) as string[]) : null
  )
  const audioContextRef = useRef<AudioContext | null>(null)
  const requestEnCursoRef = useRef(false)
  const refetchPendientesTimeoutRef = useRef<number | null>(null)

  const reproducirNotificacion = useCallback(() => {
    const context = audioContextRef.current ?? new window.AudioContext()
    audioContextRef.current = context

    void context.resume().then(() => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, context.currentTime)
      oscillator.frequency.setValueAtTime(740, context.currentTime + 0.65)
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.38, context.currentTime + 0.03)
      gain.gain.setValueAtTime(0.38, context.currentTime + 0.95)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.3)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 1.31)
    }).catch(() => undefined)
  }, [])

  const actualizarPendientes = useCallback(async () => {
    if (requestEnCursoRef.current) return
    requestEnCursoRef.current = true

    try {
      const response = await obtenerConversaciones()
      const escaladas = response.conversaciones.filter((item) => item.estado === 'escalada')
      const abiertasGuardadas = JSON.parse(
        window.localStorage.getItem('nia-conversaciones-escaladas-abiertas') ?? '[]'
      ) as string[]
      const escaladasIds = new Set(escaladas.map((item) => item.id))
      const abiertasVigentes = abiertasGuardadas.filter((id) => escaladasIds.has(id))
      const pendientes = new Set(
        escaladas.map((item) => item.id).filter((id) => !abiertasVigentes.includes(id))
      )

      window.localStorage.setItem(
        'nia-conversaciones-escaladas-abiertas',
        JSON.stringify(abiertasVigentes)
      )
      setConversacionesPendientes(pendientes.size)

      const anteriores = pendientesAnterioresRef.current
      if (anteriores && [...pendientes].some((id) => !anteriores.has(id))) {
        reproducirNotificacion()
      }
      pendientesAnterioresRef.current = pendientes
      window.sessionStorage.setItem(
        'nia-conversaciones-pendientes-detectadas',
        JSON.stringify([...pendientes])
      )
    } catch {
      // El indicador no debe interrumpir el resto del dashboard.
    } finally {
      requestEnCursoRef.current = false
    }
  }, [reproducirNotificacion])

  useEffect(() => {
    const habilitarAudio = () => {
      audioContextRef.current ??= new window.AudioContext()
      void audioContextRef.current.resume()
    }
    const conversacionAbierta = () => void actualizarPendientes()

    window.addEventListener('pointerdown', habilitarAudio, { once: true })
    window.addEventListener('nia:conversacion-abierta', conversacionAbierta)
    void actualizarPendientes()

    return () => {
      window.removeEventListener('pointerdown', habilitarAudio)
      window.removeEventListener('nia:conversacion-abierta', conversacionAbierta)
      if (refetchPendientesTimeoutRef.current) window.clearTimeout(refetchPendientesTimeoutRef.current)
    }
  }, [actualizarPendientes])

  useDashboardRealtime({
    onEvento: (evento) => {
      console.log('[DashboardLayout] Evento realtime recibido:', evento)

      window.dispatchEvent(
        new CustomEvent('nia:dashboard-event', {
          detail: evento,
        })
      )
    },
    onConversacionEscalada: (evento) => {
      console.log('[DashboardLayout] Conversación escalada:', evento)

      if (refetchPendientesTimeoutRef.current) window.clearTimeout(refetchPendientesTimeoutRef.current)
      refetchPendientesTimeoutRef.current = window.setTimeout(() => void actualizarPendientes(), 500)
    },
  })

  return (
    <div className="app-shell">
      <Sidebar conversacionesPendientes={conversacionesPendientes} />
      <div className="app-main">
        <Header title={title} />
        <main className="content">{children}</main>
        <Footer />
      </div>
      <MobileBottomNav conversacionesPendientes={conversacionesPendientes} />
    </div>
  )
}
