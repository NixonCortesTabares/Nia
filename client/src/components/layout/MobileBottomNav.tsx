import { useState } from 'react'
import { ChefHat, ClipboardList, Home, MoreHorizontal } from 'lucide-react'
import { cerrarSesion } from '../../api/authApi'
import { useRouter } from '../../routes/AppRoutes'

const primary = [
  { label: 'Inicio', path: '/dashboard', icon: Home },
  { label: 'Pedidos', path: '/pedidos', icon: ClipboardList },
  { label: 'Menu', path: '/menu', icon: ChefHat },
]

const more = [
  { label: 'Conversaciones', path: '/conversaciones' },
  { label: 'Resumen', path: '/resumen' },
  { label: 'Configuracion', path: '/configuracion' },
  { label: 'Agendar visita', path: '/agendar-visita' },
  { label: 'Cerrar sesion', path: '/login' },
]

export function MobileBottomNav({ conversacionesPendientes }: { conversacionesPendientes: number }) {
  const { path, navigate } = useRouter()
  const [open, setOpen] = useState(false)

  const go = (nextPath: string) => {
    setOpen(false)
    if (nextPath === '/login') {
      cerrarSesion()
    }
    navigate(nextPath)
  }

  return (
    <>
      {open ? (
        <div className="mobile-more">
          {more.map((item) => (
            <button key={item.path} onClick={() => go(item.path)}>
              {item.label}
              {item.path === '/conversaciones' && conversacionesPendientes > 0 ? (
                <strong className="conversation-alert-count">{conversacionesPendientes}</strong>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
      <nav className="bottom-nav" aria-label="Navegacion movil">
        {primary.map((item) => (
          <MobileNavButton key={item.path} item={item} active={path === item.path} onClick={() => go(item.path)} />
        ))}
        <button className={open ? 'active' : ''} onClick={() => setOpen((value) => !value)}><MoreHorizontal size={18} />Mas</button>
      </nav>
    </>
  )
}

function MobileNavButton({ item, active, onClick }: { item: (typeof primary)[number]; active: boolean; onClick: () => void }) {
  const Icon = item.icon

  return <button className={active ? 'active' : ''} onClick={onClick}><Icon size={18} />{item.label}</button>
}
