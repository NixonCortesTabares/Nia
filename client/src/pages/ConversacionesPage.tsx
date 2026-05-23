import { useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { conversacionesMock, type Conversacion } from '../data/mockData'

export function ConversacionesPage() {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>(conversacionesMock)

  return (
    <div className="stack">
      {conversaciones.map((conversacion) => (
        <Card key={conversacion.id} className="conversation-row">
          <div>
            <div className="order-top"><strong>{conversacion.cliente}</strong><Badge tone={conversacion.estado === 'Atendida' ? 'success' : 'warning'}>{conversacion.estado}</Badge></div>
            <p>{conversacion.ultimoMensaje}</p>
            <small>{conversacion.fecha}</small>
          </div>
          <Button variant="secondary" onClick={() => setConversaciones((current) => current.map((item) => item.id === conversacion.id ? { ...item, estado: 'Atendida' } : item))}>
            Marcar como atendida
          </Button>
        </Card>
      ))}
    </div>
  )
}
