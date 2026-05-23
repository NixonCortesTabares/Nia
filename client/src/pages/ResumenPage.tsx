import { Card } from '../components/ui/Card'
import { formatCurrency, resumenMock } from '../data/mockData'

export function ResumenPage() {
  const maxPedidos = Math.max(...resumenMock.ventasPorDia.map((item) => item.pedidos))

  return (
    <div className="stack">
      <section className="metric-grid">
        <Metric label="Pedidos ultimos 7 dias" value={resumenMock.pedidos7Dias} />
        <Metric label="Pedidos ultimo mes" value={resumenMock.pedidosMes} />
        <Metric label="Dinero vendido ultimos 7 dias" value={formatCurrency(resumenMock.ventas7Dias)} />
        <Metric label="Dinero vendido ultimo mes" value={formatCurrency(resumenMock.ventasMes)} />
        <Metric label="Ticket promedio" value={formatCurrency(resumenMock.ticketPromedio)} />
        <Metric label="Producto mas vendido" value={resumenMock.productoMasVendido} />
        <Metric label="Metodo de pago mas usado" value={resumenMock.metodoPagoMasUsado} />
        <Metric label="Pedidos cancelados" value={resumenMock.pedidosCancelados} />
      </section>
      <Card className="chart-card">
        <h2>Pedidos ultimos 7 dias</h2>
        <div className="bar-chart">
          {resumenMock.ventasPorDia.map((item) => (
            <div className="bar-item" key={item.dia}>
              <div className="bar-track"><span style={{ height: `${(item.pedidos / maxPedidos) * 100}%` }} /></div>
              <strong>{item.dia}</strong>
              <small>{item.pedidos}</small>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <Card className="metric"><span>{label}</span><strong>{value}</strong></Card>
}
