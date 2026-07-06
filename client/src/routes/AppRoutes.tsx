import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { AgendarVisitaPage } from '../pages/AgendarVisitaPage'
import { ConfiguracionPage } from '../pages/ConfiguracionPage'
import { ConversacionesPage } from '../pages/ConversacionesPage'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { MenuPage } from '../pages/MenuPage'
import { PedidosPage } from '../pages/PedidosPage'
import { ResumenPage } from '../pages/ResumenPage'
import { MenuPublicoPage } from '../pages/MenuPublicoPage'
import { PrivacidadPage } from '../pages/PrivacidadPage'
import { EliminacionDatosPage } from '../pages/EliminacionDatosPage'
import { TerminosPage } from '../pages/TerminosPage'

function tieneJwtValido() {
  const token = localStorage.getItem('token')

  if (!token) return false

  try {
    const parts = token.split('.')

    if (parts.length !== 3) return false

    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    )
    const decoded = JSON.parse(atob(padded)) as { exp?: number }

    return typeof decoded.exp === 'number' && decoded.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

function RutaPrivada({ children }: { children: ReactNode }) {
  if (!tieneJwtValido()) {
    return <Navigate to="/login" replace />
  }

  return children
}

function RutaPublicaSoloSinSesion({ children }: { children: ReactNode }) {
  if (tieneJwtValido()) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function useRouter() {
  const navigateTo = useNavigate()
  const location = useLocation()

  return {
    path: location.pathname,
    navigate: (path: string) => navigateTo(path),
  }
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/login"
          element={
            <RutaPublicaSoloSinSesion>
              <LoginPage />
            </RutaPublicaSoloSinSesion>
          }
        />
        <Route path="/agendar-visita" element={<AgendarVisitaPage />} />
        <Route path="/privacidad" element={<PrivacidadPage />} />
        <Route path="/eliminacion-datos" element={<EliminacionDatosPage />} />
        <Route path="/terminos" element={<TerminosPage />} />
        <Route path="/dashboard" element={<RutaPrivada><DashboardLayout title="Dashboard"><DashboardPage /></DashboardLayout></RutaPrivada>} />
        <Route path="/pedidos" element={<RutaPrivada><DashboardLayout title="Pedidos"><PedidosPage /></DashboardLayout></RutaPrivada>} />
        <Route path="/menu" element={<RutaPrivada><DashboardLayout title="Menu"><MenuPage /></DashboardLayout></RutaPrivada>} />
        <Route path="/conversaciones" element={<RutaPrivada><DashboardLayout title="Conversaciones"><ConversacionesPage /></DashboardLayout></RutaPrivada>} />
        <Route path="/resumen" element={<RutaPrivada><DashboardLayout title="Resumen"><ResumenPage /></DashboardLayout></RutaPrivada>} />
        <Route path="/configuracion" element={<RutaPrivada><DashboardLayout title="Configuracion"><ConfiguracionPage /></DashboardLayout></RutaPrivada>} />
        <Route path="/menu/:slug" element={<MenuPublicoPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
