import { useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/Badge'
import { formatCurrency, pedidosMock, type EstadoPedido, type Pedido } from '../data/mockData'

const estados: EstadoPedido[] = ['Pendiente', 'En cocina', 'En ruta', 'Entregado']

export function DashboardPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosMock.filter((pedido) => pedido.fecha === '2026-05-22'))

  const resumen = useMemo(() => ({
    total: pedidos.length,
    pendientes: pedidos.filter((pedido) => pedido.estado === 'Pendiente').length,
    cocina: pedidos.filter((pedido) => pedido.estado === 'En cocina').length,
    ruta: pedidos.filter((pedido) => pedido.estado === 'En ruta').length,
    entregados: pedidos.filter((pedido) => pedido.estado === 'Entregado').length,
    vendido: pedidos.filter((pedido) => pedido.estado !== 'Cancelado').reduce((sum, pedido) => sum + pedido.total, 0),
  }), [pedidos])

  const changeStatus = (id: string, estado: EstadoPedido) => {
    setPedidos((current) => current.map((pedido) => pedido.id === id ? { ...pedido, estado } : pedido))
  }

  return (
    <div className="stack">
      <section className="metric-grid">
        <Metric label="Pedidos de hoy" value={resumen.total} />
        <Metric label="Pendientes" value={resumen.pendientes} />
        <Metric label="En cocina" value={resumen.cocina} />
        <Metric label="En ruta" value={resumen.ruta} />
        <Metric label="Entregados" value={resumen.entregados} />
        <Metric label="Total vendido hoy" value={formatCurrency(resumen.vendido)} />
      </section>
      <section className="kanban">
        {estados.map((estado) => (
          <div className="kanban-column" key={estado}>
            <h2>{estado}</h2>
            {pedidos.filter((pedido) => pedido.estado === estado).map((pedido) => (
              <OrderCard key={pedido.id} pedido={pedido} onChange={changeStatus} />
            ))}
          </div>
        ))}
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <Card className="metric"><span>{label}</span><strong>{value}</strong></Card>
}

function OrderCard({ pedido, onChange }: { pedido: Pedido; onChange: (id: string, estado: EstadoPedido) => void }) {
  return (
    <Card className="order-card">
      <div className="order-top"><strong>{pedido.cliente}</strong><StatusBadge estado={pedido.estado} /></div>
      <p>{pedido.telefono}</p>
      <p>{pedido.productos.map((producto) => `${producto.cantidad}x ${producto.nombre}`).join(', ')}</p>
      <p>{pedido.direccion}</p>
      <div className="order-meta"><span>{pedido.metodoPago}</span><span>{formatCurrency(pedido.total)}</span><span>{pedido.hora}</span></div>
      <div className="button-row">
        {estados.map((estado) => <Button key={estado} variant="ghost" onClick={() => onChange(pedido.id, estado)}>{estado}</Button>)}
      </div>
    </Card>
  )
}
