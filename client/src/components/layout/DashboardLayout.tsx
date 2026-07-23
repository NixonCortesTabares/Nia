import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { obtenerConversaciones } from '../../api/conversacionesApi'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { MobileBottomNav } from './MobileBottomNav'
import { suscribirEvento } from '../../api/apiEvento'

export function DashboardLayout({ title, children }: { title: string; children: ReactNode }) {
  const [conversacionesPendientes, setConversacionesPendientes] = useState(0)

  const pendientesAnterioresRef = useRef<Set<string> | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const isAudioEnabledRef = useRef(false)
  const requestEnCursoRef = useRef(false)

  // ==================== AUDIO ====================
  const playSound = useCallback((context: AudioContext) => {
    try {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const now = context.currentTime

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, now)
      oscillator.frequency.setValueAtTime(740, now + 0.65)

      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.38, now + 0.03)
      gain.gain.setValueAtTime(0.38, now + 0.95)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3)

      oscillator.connect(gain)
      gain.connect(context.destination)

      oscillator.start()
      oscillator.stop(now + 1.31)
    } catch (err) {
      console.error('Error reproduciendo sonido:', err)
    }
  }, [])

  const reproducirNotificacion = useCallback(() => {
    if (!isAudioEnabledRef.current || !audioContextRef.current) {
      console.warn('🔇 Audio no habilitado aún')
      return
    }

    const context = audioContextRef.current

    if (context.state === 'suspended') {
      context.resume().then(() => playSound(context))
    } else {
      playSound(context)
    }
  }, [playSound])

  // ==================== ACTUALIZAR PENDIENTES ====================
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

      // Detectar nuevas conversaciones escaladas
      const anteriores = pendientesAnterioresRef.current
      if (anteriores && [...pendientes].some((id) => !anteriores.has(id))) {
        reproducirNotificacion()
      }

      pendientesAnterioresRef.current = pendientes
      window.sessionStorage.setItem(
        'nia-conversaciones-pendientes-detectadas',
        JSON.stringify([...pendientes])
      )
    } catch (error) {
      console.error('Error actualizando conversaciones pendientes:', error)
    } finally {
      requestEnCursoRef.current = false
    }
  }, [reproducirNotificacion])

  // ==================== HABILITAR AUDIO ====================
  useEffect(() => {
    const habilitarAudio = () => {
      if (audioContextRef.current) return

      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)()
        audioContextRef.current = context
        isAudioEnabledRef.current = true

        context.resume().then(() => {
         // console.log('✅ AudioContext habilitado')
        })
      } catch (e) {
        console.error('Error creando AudioContext', e)
      }
    }

    window.addEventListener('pointerdown', habilitarAudio, { once: true })
    window.addEventListener('click', habilitarAudio, { once: true })

    return () => {
      window.removeEventListener('pointerdown', habilitarAudio)
      window.removeEventListener('click', habilitarAudio)
      audioContextRef.current?.close()
    }
  }, [])

  // ==================== ESCUCHAR EVENTOS DEL BACKEND ====================
  useEffect(() => {
    let isMounted = true

    async function escuchar() {
      while (isMounted) {
        try {
          const evento = await suscribirEvento()

          if (!isMounted) break

          //console.log('EVENTO NUEVO RECIBIDO::', evento.mensaje)

          if (evento.evento === 'nuevo_pedido') {
            window.dispatchEvent(new CustomEvent('pedido_nuevo'))
          }

          if (evento.evento === 'nuevo_mensaje') {
            window.dispatchEvent(new CustomEvent('nuevo_mensaje'))
          }

          if (evento.evento === 'conversacion_escalada') {
            actualizarPendientes()
          }
        } catch (error) {
          //console.error('Error en la suscripción de eventos:', error)
          if (isMounted) {
            await new Promise((resolve) => setTimeout(resolve, 4000))
          }
        }
      }
    }

    escuchar()

    // Cleanup
    return () => {
      isMounted = false
    }
  }, [actualizarPendientes])

  // Carga inicial
  useEffect(() => {
    actualizarPendientes()
  }, [actualizarPendientes])

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