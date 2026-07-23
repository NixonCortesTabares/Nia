import { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/ui/Card'
import { obtenerPedidos, type Pedido } from '../api/pedidosApi'
import { getApiErrorMessage } from '../api/apiClient'

type VentaPorDia = {
  dia: string
  fechaKey: string
  pedidos: number
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function esPedidoVendido(pedido: Pedido) {
  return pedido.estado !== 'cancelado'
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getDateKeyFromIso(fechaIso: string) {
  return toDateKey(new Date(fechaIso))
}

function getShortDayLabel(date: Date) {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'short',
  }).format(date)
}

function calcularVentasPorDia(pedidos: Pedido[]): VentaPorDia[] {
  const dias: VentaPorDia[] = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    dias.push({
      dia: getShortDayLabel(date),
      fechaKey: toDateKey(date),
      pedidos: 0,
    })
  }

  const conteoPorDia = new Map<string, number>()

  pedidos.forEach((pedido) => {
    const fechaKey = getDateKeyFromIso(pedido.creadoEn)
    conteoPorDia.set(fechaKey, (conteoPorDia.get(fechaKey) ?? 0) + 1)
  })

  return dias.map((dia) => ({
    ...dia,
    pedidos: conteoPorDia.get(dia.fechaKey) ?? 0,
  }))
}

function calcularProductoMasVendido(pedidos: Pedido[]) {
  const productos = new Map<string, number>()

  pedidos
    .filter(esPedidoVendido)
    .forEach((pedido) => {
      pedido.productos.forEach((producto) => {
        productos.set(
          producto.nombreProducto,
          (productos.get(producto.nombreProducto) ?? 0) + producto.cantidad
        )
      })
    })

  let productoMasVendido = 'Sin datos'
  let mayorCantidad = 0

  productos.forEach((cantidad, nombre) => {
    if (cantidad > mayorCantidad) {
      mayorCantidad = cantidad
      productoMasVendido = `${nombre} (${cantidad})`
    }
  })

  return productoMasVendido
}

function calcularMetodoPagoMasUsado(pedidos: Pedido[]) {
  const metodos = new Map<string, number>()

  pedidos
    .filter(esPedidoVendido)
    .forEach((pedido) => {
      if (!pedido.metodoPago) return

      metodos.set(
        pedido.metodoPago,
        (metodos.get(pedido.metodoPago) ?? 0) + 1
      )
    })

  let metodoMasUsado = 'Sin datos'
  let mayorCantidad = 0

  metodos.forEach((cantidad, metodo) => {
    if (cantidad > mayorCantidad) {
      mayorCantidad = cantidad
      metodoMasUsado = `${metodo} (${cantidad})`
    }
  })

  return metodoMasUsado
}

async function cargarTodosLosPedidosPorRango(rango: '7d' | '30d') {
  const limit = 100
  let offset = 0
  let pedidos: Pedido[] = []
  let seguirCargando = true
  let paginasCargadas = 0

  while (seguirCargando && paginasCargadas < 20) {
    const response = await obtenerPedidos({
      rango,
      limit,
      offset,
    })

    pedidos = [...pedidos, ...response.pedidos]

    if (response.pedidos.length < limit) {
      seguirCargando = false
    } else {
      offset += limit
      paginasCargadas++
    }
  }
  return pedidos
}

export function ResumenPage() {
  const [pedidos7Dias, setPedidos7Dias] = useState<Pedido[]>([])
  const [pedidosMes, setPedidosMes] = useState<Pedido[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarResumen() {
      try {
        setLoading(true)
        setError('')

        const [pedidos7DiasResponse, pedidosMesResponse] = await Promise.all([
          cargarTodosLosPedidosPorRango('7d'),
          cargarTodosLosPedidosPorRango('30d'),
        ])

        setPedidos7Dias(pedidos7DiasResponse)
        setPedidosMes(pedidosMesResponse)
      } catch (error) {
        setError(getApiErrorMessage(error))
      } finally {
        setLoading(false)
      }
    }

    cargarResumen()
  }, [])

  const resumen = useMemo(() => {
    const pedidosVendidos7Dias = pedidos7Dias.filter(esPedidoVendido)
    const pedidosVendidosMes = pedidosMes.filter(esPedidoVendido)

    const ventas7Dias = pedidosVendidos7Dias.reduce(
      (sum, pedido) => sum + pedido.total,
      0
    )

    const ventasMes = pedidosVendidosMes.reduce(
      (sum, pedido) => sum + pedido.total,
      0
    )

    const ticketPromedio =
      pedidosVendidosMes.length > 0
        ? ventasMes / pedidosVendidosMes.length
        : 0

    return {
      pedidos7Dias: pedidos7Dias.length,
      pedidosMes: pedidosMes.length,
      ventas7Dias,
      ventasMes,
      ticketPromedio,
      productoMasVendido: calcularProductoMasVendido(pedidosMes),
      metodoPagoMasUsado: calcularMetodoPagoMasUsado(pedidosMes),
      pedidosCancelados: pedidosMes.filter(
        (pedido) => pedido.estado === 'cancelado'
      ).length,
      ventasPorDia: calcularVentasPorDia(pedidos7Dias),
    }
  }, [pedidos7Dias, pedidosMes])

  const maxPedidos = Math.max(
    1,
    ...resumen.ventasPorDia.map((item) => item.pedidos)
  )

  if (loading) {
    return (
      <div className="stack">
        <Card>
          <p>Cargando resumen...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="stack">
      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <section className="metric-grid">
        <Metric label="Pedidos últimos 7 días" value={resumen.pedidos7Dias} />
        <Metric label="Pedidos último mes" value={resumen.pedidosMes} />
        <Metric
          label="Dinero ganado últimos 7 días"
          value={formatCurrency(resumen.ventas7Dias)}
        />
        <Metric
          label="Dinero ganado último mes"
          value={formatCurrency(resumen.ventasMes)}
        />
        <Metric
          label="precio promedio por pedido"
          value={formatCurrency(resumen.ticketPromedio)}
        />
        <Metric
          label="Producto más vendido"
          value={resumen.productoMasVendido}
        />
        <Metric
          label="Método de pago más usado"
          value={resumen.metodoPagoMasUsado}
        />
        <Metric
          label="Pedidos cancelados"
          value={resumen.pedidosCancelados}
        />
      </section>

      <Card className="chart-card">
        <div className="section-header">
          <div>
            <h2>Pedidos últimos 7 días</h2>
            <p>Distribución diaria de pedidos recibidos.</p>
          </div>
        </div>

        <div className="bar-chart">
          {resumen.ventasPorDia.map((item) => (
            <div className="bar-item" key={item.fechaKey}>
              <div className="bar-track">
                <span
                  style={{
                    height: `${(item.pedidos / maxPedidos) * 100}%`,
                  }}
                />
              </div>

              <strong>{item.dia}</strong>
              <small>{item.pedidos}</small>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <Card className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </Card>
  )
}