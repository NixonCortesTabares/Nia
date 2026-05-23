import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useRouter } from '../routes/AppRoutes'

export function AgendarVisitaPage() {
  const { navigate } = useRouter()
  const [sent, setSent] = useState(false)

  return (
    <main className="auth-page schedule-page">
      <Card className="wide-card">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Formulario comercial</p>
            <h1>Agendar visita</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate('/login')}>Volver</Button>
        </div>
        {sent ? <p className="success-message">Solicitud registrada de forma mock. El equipo comercial te contactara pronto.</p> : null}
        <form className="form two-columns" onSubmit={(event) => { event.preventDefault(); setSent(true) }}>
          <label>Nombre del negocio<input required /></label>
          <label>Nombre del encargado<input required /></label>
          <label>Telefono / WhatsApp<input required /></label>
          <label>Ciudad<input required /></label>
          <label>Tipo de negocio<input placeholder="Restaurante, cafe, comidas rapidas" /></label>
          <label>Volumen aproximado de pedidos por WhatsApp<input placeholder="Ej. 80 por dia" /></label>
          <label>Horario preferido para contacto<input placeholder="Ej. 9:00 a.m. - 12:00 m." /></label>
          <label className="full">Comentarios<textarea rows={4} /></label>
          <Button variant="primary" type="submit">Enviar solicitud</Button>
        </form>
      </Card>
    </main>
  )
}
