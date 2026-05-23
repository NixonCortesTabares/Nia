import { useMemo, useState } from 'react'
import { Badge, StatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { formatCurrency, pedidosMock, type EstadoPedido, type Pedido } from '../data/mockData'

const periods = ['Hoy', 'Ayer', 'Ultimos 7 dias', 'Ultimo mes']
const states: Array<EstadoPedido | 'Todos'> = ['Todos', 'Pendiente', 'En cocina', 'En ruta', 'Entregado', 'Cancelado']

export function PedidosPage() {
  const [period, setPeriod] = useState('Hoy')
  const [state, setState] = useState<EstadoPedido | 'Todos'>('Todos')
  const [selected, setSelected] = useState<Pedido | null>(null)
  const pedidos = useMemo(() => pedidosMock.filter((pedido) => state === 'Todos' || pedido.estado === state), [state])

  return (
    <div className="stack">
      <div className="filters">
        {periods.map((item) => <Button key={item} variant={period === item ? 'primary' : 'secondary'} onClick={() => setPeriod(item)}>{item}</Button>)}
        <select value={state} onChange={(event) => setState(event.target.value as EstadoPedido | 'Todos')}>
          {states.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="table-wrap">
        <table className="orders-table">
          <thead><tr><th>Pedido</th><th>Cliente</th><th>Productos</th><th>Pago</th><th>Total</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.id}<small>{pedido.fecha} {pedido.hora}</small></td>
                <td>{pedido.cliente}<small>{pedido.telefono}</small></td>
                <td>{pedido.productos.map((producto) => producto.nombre).join(', ')}</td>
                <td>{pedido.metodoPago}</td>
                <td>{formatCurrency(pedido.total)}</td>
                <td><StatusBadge estado={pedido.estado} /></td>
                <td><Button variant="ghost" onClick={() => setSelected(pedido)}>Ver</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mobile-list">
        {pedidos.map((pedido) => (
          <Card key={pedido.id} className="order-card" onClick={() => setSelected(pedido)}>
            <div className="order-top"><strong>{pedido.id}</strong><StatusBadge estado={pedido.estado} /></div>
            <p>{pedido.cliente} - {pedido.telefono}</p>
            <p>{pedido.productos.map((producto) => producto.nombre).join(', ')}</p>
            <div className="order-meta"><span>{pedido.metodoPago}</span><span>{formatCurrency(pedido.total)}</span></div>
          </Card>
        ))}
      </div>
      {selected ? <PedidoDetalle pedido={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  )
}

function PedidoDetalle({ pedido, onClose }: { pedido: Pedido; onClose: () => void }) {
  return (
    <Modal title={`Detalle ${pedido.id}`} onClose={onClose}>
      <div className="detail-grid">
        <Info label="Cliente" value={pedido.cliente} />
        <Info label="Telefono" value={pedido.telefono} />
        <Info label="Tipo de entrega" value={pedido.tipoEntrega} />
        <Info label="Direccion" value={pedido.direccion} />
        <Info label="Metodo de pago" value={pedido.metodoPago} />
        <div><span className="label">Estado</span><StatusBadge estado={pedido.estado} /></div>
        <Info label="Fecha/hora" value={`${pedido.fecha} ${pedido.hora}`} />
        <Info label="Total" value={formatCurrency(pedido.total)} />
      </div>
      <h3>Productos</h3>
      <div className="stack compact">
        {pedido.productos.map((producto) => (
          <Card key={producto.nombre} className="line-item">
            <strong>{producto.cantidad}x {producto.nombre}</strong>
            <span>{formatCurrency(producto.precio)}</span>
            {producto.extras.length ? <Badge>{producto.extras.join(', ')}</Badge> : null}
            {producto.notas ? <p>{producto.notas}</p> : null}
          </Card>
        ))}
      </div>
    </Modal>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><span className="label">{label}</span><strong>{value}</strong></div>
}
