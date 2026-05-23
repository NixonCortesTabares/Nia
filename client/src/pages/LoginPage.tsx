import { Button } from '../components/ui/Button'
import { useRouter } from '../routes/AppRoutes'

export function LoginPage() {
  const { navigate } = useRouter()

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="brand-mark">N</span>
          <div>
            <h1>Nia Pedidos</h1>
            <p>Panel operativo para pedidos por WhatsApp</p>
          </div>
        </div>
        <form className="form" onSubmit={(event) => { event.preventDefault(); navigate('/dashboard') }}>
          <label>Email<input type="email" placeholder="operacion@restaurante.com" required /></label>
          <label>Contrasena<input type="password" placeholder="••••••••" required /></label>
          <Button variant="primary" type="submit">Ingresar</Button>
          <Button variant="ghost" type="button" onClick={() => navigate('/agendar-visita')}>Agendar visita</Button>
        </form>
      </section>
    </main>
  )
}
