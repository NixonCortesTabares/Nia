import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import {
  actualizarEstadoPedido,
  obtenerPedidos,
  type Pedido,
} from '../api/pedidosApi';
import { getApiErrorMessage } from '../api/apiClient';

type PeriodoFiltro = 'Hoy' | 'Ayer' | 'Ultimos 7 dias' | 'Ultimo mes';

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

type EstadoFiltro = 'Todos' | EstadoPedidoFront;

const periods: PeriodoFiltro[] = [
  'Hoy',
  'Ayer',
  'Ultimos 7 dias',
  'Ultimo mes',
];

const states: EstadoFiltro[] = [
  'Todos',
  'Pendiente',
  'En cocina',
  'En ruta',
  'Entregado',
  'Cancelado',
];

const estadosPedido: Array<{
  backend: EstadoPedidoBackend;
  label: EstadoPedidoFront;
}> = [
  { backend: 'pendiente', label: 'Pendiente' },
  { backend: 'en_cocina', label: 'En cocina' },
  { backend: 'en_ruta', label: 'En ruta' },
  { backend: 'entregado', label: 'Entregado' },
  { backend: 'cancelado', label: 'Cancelado' },
];

const POLLING_INTERVAL_MS = 30000;

const estadoFrontToBackend: Record<EstadoPedidoFront, EstadoPedidoBackend> = {
  Pendiente: 'pendiente',
  'En cocina': 'en_cocina',
  'En ruta': 'en_ruta',
  Entregado: 'entregado',
  Cancelado: 'cancelado',
};

const estadoBackendToFront: Record<string, EstadoPedidoFront> = {
  pendiente: 'Pendiente',
  en_cocina: 'En cocina',
  en_ruta: 'En ruta',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(fechaIso: string) {
  return new Date(fechaIso).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function obtenerFiltroPeriodo(period: PeriodoFiltro) {
  if (period === 'Hoy') {
    return {
      rango: 'hoy' as const,
    };
  }

  if (period === 'Ultimos 7 dias') {
    return {
      rango: '7d' as const,
    };
  }

  if (period === 'Ultimo mes') {
    return {
      rango: '30d' as const,
    };
  }

  const hoy = new Date();
  const ayer = new Date();

  ayer.setDate(hoy.getDate() - 1);

  return {
    desde: formatDateInput(ayer),
    hasta: formatDateInput(hoy),
  };
}

function estadoToLabel(estado: string): EstadoPedidoFront {
  return estadoBackendToFront[estado] ?? 'Pendiente';
}

export function PedidosPage() {
  const [period, setPeriod] = useState<PeriodoFiltro>('Hoy');
  const [state, setState] = useState<EstadoFiltro>('Todos');
  const [selected, setSelected] = useState<Pedido | null>(null);

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingPedidoId, setUpdatingPedidoId] = useState<string | null>(null);
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

      const filtroPeriodo = obtenerFiltroPeriodo(period);

      const response = await obtenerPedidos({
        ...filtroPeriodo,
        estado:
          state === 'Todos'
            ? undefined
            : estadoFrontToBackend[state],
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
  }, [period, state]);

  useEffect(() => {
    cargarPedidos();

    const intervalId = window.setInterval(() => {
      cargarPedidos({ silent: true });
    }, POLLING_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [cargarPedidos]);

  async function changeStatus(id: string, estado: EstadoPedidoBackend) {
    const pedidosAnteriores = pedidos;
    const selectedAnterior = selected;

    try {
      setError('');
      setUpdatingPedidoId(id);
      setPedidos((current) =>
        current.map((pedido) =>
          pedido.id === id ? { ...pedido, estado } : pedido
        )
      );
      setSelected((current) =>
        current?.id === id ? { ...current, estado } : current
      );

      await actualizarEstadoPedido(id, estado);
      await cargarPedidos({ silent: true });
    } catch (error) {
      setPedidos(pedidosAnteriores);
      setSelected(selectedAnterior);
      setError(getApiErrorMessage(error));
    } finally {
      setUpdatingPedidoId(null);
    }
  }

  return (
    <div className="stack">
      <div className="filters">
        {periods.map((item) => (
          <Button
            key={item}
            variant={period === item ? 'primary' : 'secondary'}
            onClick={() => setPeriod(item)}
          >
            {item}
          </Button>
        ))}

        <select
          value={state}
          onChange={(event) => setState(event.target.value as EstadoFiltro)}
        >
          {states.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        {refreshing && (
          <span className="text-sm text-[var(--muted)]">Actualizando pedidos...</span>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <Card>
          <p>Cargando pedidos...</p>
        </Card>
      )}

      {!loading && pedidos.length === 0 && (
        <Card>
          <p>No hay pedidos para los filtros seleccionados.</p>
        </Card>
      )}

      {!loading && pedidos.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th>Pago</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td>
                      #{pedido.id.slice(0, 8)}
                      <small>{formatDateTime(pedido.creadoEn)}</small>
                    </td>

                    <td>
                      {pedido.cliente?.nombre ?? 'Cliente sin nombre'}
                      <small>{pedido.cliente?.telefono ?? 'Sin teléfono'}</small>
                    </td>

                    <td>
                      <div className="grid gap-1">
                        {pedido.productos.length > 0 ? (
                          pedido.productos.map((producto, index) => (
                            <span
                              key={`${pedido.id}-${producto.nombreProducto}-${index}`}
                              className="font-medium text-[var(--text)]"
                            >
                              {producto.cantidad}x {producto.nombreProducto}
                            </span>
                          ))
                        ) : (
                          <span>Sin productos</span>
                        )}
                      </div>
                    </td>

                    <td>{pedido.metodoPago ?? 'Sin método'}</td>

                    <td>{formatCurrency(pedido.total)}</td>

                    <td>
                      <EstadoPedidoSelect
                        estado={pedido.estado}
                        disabled={updatingPedidoId === pedido.id}
                        onChange={(estado) => changeStatus(pedido.id, estado)}
                      />
                    </td>

                    <td>
                      <Button
                        variant="ghost"
                        onClick={() => setSelected(pedido)}
                      >
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mobile-list">
            {pedidos.map((pedido) => (
              <Card
                key={pedido.id}
                className="order-card"
                onClick={() => setSelected(pedido)}
              >
                <div className="order-top">
                  <strong>#{pedido.id.slice(0, 8)}</strong>
                  <EstadoPedidoSelect
                    estado={pedido.estado}
                    disabled={updatingPedidoId === pedido.id}
                    onChange={(estado) => changeStatus(pedido.id, estado)}
                  />
                </div>

                <p>
                  {pedido.cliente?.nombre ?? 'Cliente sin nombre'} -{' '}
                  {pedido.cliente?.telefono ?? 'Sin teléfono'}
                </p>

                <div className="grid gap-2 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                  {pedido.productos.length > 0 ? (
                    pedido.productos.map((producto, index) => (
                      <div
                        key={`${pedido.id}-${producto.nombreProducto}-${index}`}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="font-medium text-[var(--text)]">
                          {producto.cantidad}x {producto.nombreProducto}
                        </span>

                        <span>{formatCurrency(producto.subtotal)}</span>
                      </div>
                    ))
                  ) : (
                    <p>Sin productos</p>
                  )}
                </div>

                <div className="order-meta">
                  <span>{pedido.metodoPago ?? 'Sin método'}</span>
                  <span>{formatCurrency(pedido.total)}</span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {selected ? (
        <PedidoDetalle
          pedido={selected}
          updating={updatingPedidoId === selected.id}
          onChangeStatus={(estado) => changeStatus(selected.id, estado)}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}

function PedidoDetalle({
  pedido,
  updating,
  onChangeStatus,
  onClose,
}: {
  pedido: Pedido;
  updating: boolean;
  onChangeStatus: (estado: EstadoPedidoBackend) => void;
  onClose: () => void;
}) {
  return (
    <Modal title={`Detalle #${pedido.id.slice(0, 8)}`} onClose={onClose}>
      <div className="detail-grid">
        <Info
          label="Cliente"
          value={pedido.cliente?.nombre ?? 'Cliente sin nombre'}
        />

        <Info
          label="Teléfono"
          value={pedido.cliente?.telefono ?? 'Sin teléfono'}
        />

        <Info
          label="Tipo de entrega"
          value={pedido.tipoEntrega}
        />

        <Info
          label="Dirección"
          value={
            pedido.tipoEntrega === 'domicilio'
              ? pedido.direccionEntrega ?? 'Sin dirección'
              : 'Recoger en restaurante'
          }
        />

        <Info
          label="Método de pago"
          value={pedido.metodoPago ?? 'Sin método de pago'}
        />

        <div>
          <span className="label">Estado</span>
          <EstadoPedidoSelect
            estado={pedido.estado}
            disabled={updating}
            onChange={onChangeStatus}
          />
        </div>

        <Info
          label="Fecha/hora"
          value={formatDateTime(pedido.creadoEn)}
        />

        <Info
          label="Total"
          value={formatCurrency(pedido.total)}
        />
      </div>

      <h3>Productos</h3>

      <div className="stack compact">
        {pedido.productos.length > 0 ? (
          pedido.productos.map((producto, index) => (
            <Card
              key={`${producto.nombreProducto}-${index}`}
              className="line-item"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <span className="inline-flex min-h-7 min-w-7 items-center justify-center rounded-md border border-[var(--border)] text-sm font-bold text-[var(--text)]">
                    {producto.cantidad}x
                  </span>

                  <div>
                    <strong>{producto.nombreProducto}</strong>

                    <p>
                      Precio unitario:{' '}
                      {formatCurrency(producto.precioUnitario)}
                    </p>
                  </div>
                </div>

                <strong>{formatCurrency(producto.subtotal)}</strong>
              </div>

              {producto.notas ? <Badge>{producto.notas}</Badge> : null}
            </Card>
          ))
        ) : (
          <Card>
            <p>Este pedido no tiene productos registrados.</p>
          </Card>
        )}
      </div>
    </Modal>
  );
}

function EstadoPedidoSelect({
  estado,
  disabled,
  onChange,
}: {
  estado: string;
  disabled: boolean;
  onChange: (estado: EstadoPedidoBackend) => void;
}) {
  return (
    <div className="grid gap-2" onClick={(event) => event.stopPropagation()}>
      <StatusBadge estado={estadoToLabel(estado)} />
      <select
        value={estado}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as EstadoPedidoBackend)}
      >
        {estadosPedido.map((item) => (
          <option key={item.backend} value={item.backend}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <span className="label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
