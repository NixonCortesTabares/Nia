import { BarChart3, ChefHat, ClipboardList, Home, MessageSquare, Settings } from 'lucide-react'
import { useRouter } from '../../routes/AppRoutes'

const items = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Pedidos', path: '/pedidos', icon: ClipboardList },
  { label: 'Menu', path: '/menu', icon: ChefHat },
  { label: 'Conversaciones', path: '/conversaciones', icon: MessageSquare },
  { label: 'Resumen', path: '/resumen', icon: BarChart3 },
  { label: 'Configuracion', path: '/configuracion', icon: Settings },
]

export function Sidebar() {
  const { path, navigate } = useRouter()

  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => navigate('/dashboard')}>
        <span className="brand-mark">N</span>
        <span>
          <strong>Nia</strong>
          <small>Pedidos</small>
        </span>
      </button>
      <nav className="sidebar-nav" aria-label="Principal">
        {items.map((item) => (
          <NavButton key={item.path} item={item} active={path === item.path} onClick={() => navigate(item.path)} />
        ))}
      </nav>
    </aside>
  )
}

function NavButton({ item, active, onClick }: { item: (typeof items)[number]; active: boolean; onClick: () => void }) {
  const Icon = item.icon

  return (
    <button
      className={active ? 'nav-item active' : 'nav-item'}
      onClick={onClick}
    >
      <span><Icon size={16} strokeWidth={1.8} /></span>
      {item.label}
    </button>
  )
}
