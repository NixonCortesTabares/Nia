import { useEffect, useState } from 'react'
import { LogOut, Moon, Sun } from 'lucide-react'
import { Button } from '../ui/Button'
import { useRouter } from '../../routes/AppRoutes'

export function Header({ title }: { title: string }) {
  const { navigate } = useRouter()
  const [dark, setDark] = useState(() => localStorage.getItem('nia-theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('nia-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Operacion diaria</p>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <Button variant="ghost" icon={dark ? <Sun size={16} /> : <Moon size={16} />} onClick={() => setDark((value) => !value)}>
          {dark ? 'Claro' : 'Oscuro'}
        </Button>
        <Button variant="secondary" icon={<LogOut size={16} />} onClick={() => navigate('/login')}>Cerrar sesion</Button>
      </div>
    </header>
  )
}
