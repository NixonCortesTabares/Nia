import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import {
  obtenerPedidos,
  actualizarEstadoPedido,
  type Pedido,
} from '../api/pedidosApi';
import { getApiErrorMessage } from '../api/apiClient';
import { ProductoResumen } from '../utils/ProductoResumen';

type EstadoPedidoBackend =
  | 'pendiente'
  | 'en_cocina'
  | 'en_ruta'
  | 'entregado'
  | 'cancelado';

type EstadoPedidoFront =
  | 'Pendiente'
  | 'En cocina'
  | 'En ruta'
  | 'Entregado'
  | 'Cancelado';

const estados: Array<{
  backend: EstadoPedidoBackend;
  label: EstadoPedidoFront;
}> = [
    { backend: 'pendiente', label: 'Pendiente' },
    { backend: 'en_cocina', label: 'En cocina' },
    { backend: 'en_ruta', label: 'En ruta' },
    { backend: 'entregado', label: 'Entregado' },
  ];

const POLLING_INTERVAL_MS = 30000;

function estadoToLabel(estado: string): EstadoPedidoFront {
  const estadoEncontrado = estados.find((item) => item.backend === estado);

  if (estadoEncontrado) {
    return estadoEncontrado.label;
  }

  if (estado === 'cancelado') {
    return 'Cancelado';
  }

  return 'Pendiente';
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatHora(fechaIso: string) {
  return new Date(fechaIso).toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
  });
}
export function DashboardPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const isFetchingRef = useRef(false);

  const cargarPedidos = useCallback(async (options?: { silent?: boolean }) => {
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setError('');

      if (options?.silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await obtenerPedidos({
        rango: 'hoy',
        limit: 100,
        offset: 0,
      });

      setPedidos(response.pedidos);
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    cargarPedidos();

    const intervalId = window.setInterval(() => {
      cargarPedidos({ silent: true });
    }, POLLING_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [cargarPedidos]);

  const resumen = useMemo(
    () => ({
      total: pedidos.length,
      pendientes: pedidos.filter((pedido) => pedido.estado === 'pendiente').length,
      cocina: pedidos.filter((pedido) => pedido.estado === 'en_cocina').length,
      ruta: pedidos.filter((pedido) => pedido.estado === 'en_ruta').length,
      entregados: pedidos.filter((pedido) => pedido.estado === 'entregado').length,
      vendido: pedidos
        .filter((pedido) => pedido.estado !== 'cancelado')
        .reduce((sum, pedido) => sum + pedido.total, 0),
    }),
    [pedidos]
  );

  async function changeStatus(id: string, estado: EstadoPedidoBackend) {
    const pedidosAnteriores = pedidos;

    try {
      setPedidos((current) =>
        current.map((pedido) =>
          pedido.id === id ? { ...pedido, estado } : pedido
        )
      );

      await actualizarEstadoPedido(id, estado);
    } catch (error) {
      setPedidos(pedidosAnteriores);
      setError(getApiErrorMessage(error));
    }
  }

  if (loading) {
    return (
      <div className="stack">
        <Card>
          <p>Cargando dashboard...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="stack">
      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {refreshing && (
        <span className="text-sm text-[var(--muted)]">Actualizando pedidos...</span>
      )}

      <section className="metric-grid">
        <Metric label="Pedidos de hoy" value={resumen.total} />
        <Metric label="Pendientes" value={resumen.pendientes} hideOnMobile />
        <Metric label="En cocina" value={resumen.cocina} hideOnMobile />
        <Metric label="En ruta" value={resumen.ruta} hideOnMobile />
        <Metric label="Entregados" value={resumen.entregados} />
        <Metric label="Total vendido hoy" value={formatCurrency(resumen.vendido)} />
      </section>

      <section className="kanban">
        {estados.map((estado) => (
          <div className="kanban-column" key={estado.backend}>
            <h2>{estado.label}</h2>

            {pedidos
              .filter((pedido) => pedido.estado === estado.backend)
              .map((pedido) => (
                <OrderCard
                  key={pedido.id}
                  pedido={pedido}
                  onChange={changeStatus}
                />
              ))}

            {pedidos.filter((pedido) => pedido.estado === estado.backend).length === 0 && (
              <p>No hay pedidos en este estado.</p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

function Metric({ label, value, hideOnMobile = false }: { label: string; value: string | number; hideOnMobile?: boolean }) {
  return (
    <Card className={`metric ${hideOnMobile ? 'metric-mobile-hidden' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </Card>
  );
}

function OrderCard({
  pedido,
  onChange,
}: {
  pedido: Pedido;
  onChange: (id: string, estado: EstadoPedidoBackend) => void;
}) {
  return (
    <Card className="order-card">
      <div className="order-top">
        <div className="grid min-w-0 gap-1">
          <strong className="overflow-hidden break-words text-base text-[var(--text)]">
            {pedido.cliente?.nombre ?? 'Cliente sin nombre'}
          </strong>

          <span className="overflow-hidden break-words text-sm text-[var(--muted)]">
            {pedido.cliente?.telefono ?? 'Sin teléfono'}
          </span>
        </div>

        <div className="shrink-0">
          <StatusBadge estado={estadoToLabel(pedido.estado)} />
        </div>
      </div>

      <div className="grid min-w-0 gap-2 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Productos
        </span>

        {pedido.productos.length > 0 ? (
          <div className="grid min-w-0 gap-2">
            {pedido.productos.map((producto, index) => (
              <ProductoResumen
                key={`${pedido.id}-${producto.nombreProducto}-${index}`}
                producto={producto}
              />
            ))}
          </div>
        ) : (
          <p>Sin productos registrados</p>
        )}
      </div>

      <div className="grid min-w-0 gap-3 overflow-hidden rounded-md border border-[var(--border)] p-3">
        <InfoLine
          label="Entrega"
          value={
            pedido.tipoEntrega === 'domicilio'
              ? pedido.direccionEntrega ?? 'Sin dirección'
              : 'Recoger en restaurante'
          }
        />

        <InfoLine
          label="Costo domicilio"
          value={pedido.costoDomicilio}
        />

        <InfoLine
          label="Método de pago"
          value={pedido.metodoPago ?? 'Sin método de pago'}
        />

        <div className="flex min-w-0 items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
          <span className="text-sm font-semibold text-[var(--muted)]">
            Total
          </span>

          <strong className="shrink-0 text-xl text-[var(--text)]">
            {formatCurrency(pedido.total)}
          </strong>
        </div>

        <div className="flex min-w-0 items-center justify-between gap-3">
          <span className="text-sm font-semibold text-[var(--muted)]">
            Hora
          </span>

          <span className="min-w-0 break-words text-right text-sm text-[var(--text)]">
            {formatHora(pedido.creadoEn)}
          </span>
        </div>
      </div>

      <div className="button-row">
        {estados.map((estado) => (
          <Button
            key={estado.backend}
            variant="ghost"
            onClick={() => onChange(pedido.id, estado.backend)}
          >
            {estado.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}

function InfoLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3">
      <span className="shrink-0 text-sm font-semibold text-[var(--muted)]">
        {label}
      </span>

      <span className="min-w-0 break-words text-right text-sm font-medium text-[var(--text)]">
        {value}
      </span>
    </div>
  );
}
