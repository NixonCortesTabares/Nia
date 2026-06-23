import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
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
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/agendar-visita" element={<AgendarVisitaPage />} />
        <Route path="/privacidad" element={<PrivacidadPage />} />
        <Route path="/eliminacion-datos" element={<EliminacionDatosPage />} />
        <Route path="/dashboard" element={<DashboardLayout title="Dashboard"><DashboardPage /></DashboardLayout>} />
        <Route path="/pedidos" element={<DashboardLayout title="Pedidos"><PedidosPage /></DashboardLayout>} />
        <Route path="/menu" element={<DashboardLayout title="Menu"><MenuPage /></DashboardLayout>} />
        <Route path="/conversaciones" element={<DashboardLayout title="Conversaciones"><ConversacionesPage /></DashboardLayout>} />
        <Route path="/resumen" element={<DashboardLayout title="Resumen"><ResumenPage /></DashboardLayout>} />
        <Route path="/configuracion" element={<DashboardLayout title="Configuracion"><ConfiguracionPage /></DashboardLayout>} />
        <Route path="/menu/:slug" element={<MenuPublicoPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
