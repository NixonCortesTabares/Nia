import type { PedidoProducto } from '../api/pedidosApi';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductoResumen({
  producto,
}: {
  producto: PedidoProducto;
}) {
  return (
    <div className="grid min-w-0 gap-2 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)] p-2">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <span className="inline-flex min-h-7 min-w-7 items-center justify-center rounded-md border border-[var(--border)] text-sm font-bold text-[var(--text)]">
            {producto.cantidad}x
          </span>

          <div className="grid min-w-0 gap-1">
            <strong className="break-words text-sm text-[var(--text)] [overflow-wrap:anywhere]">
              {producto.nombreProducto}
            </strong>

            {producto.extras.length > 0 && (
              <div className="grid min-w-0 gap-1">
                {producto.extras.map((extra, index) => (
                  <span
                    key={`${producto.nombreProducto}-${extra.nombreExtra}-${index}`}
                    className="break-words text-xs text-[var(--muted)] [overflow-wrap:anywhere]"
                  >
                    + {extra.cantidad}x {extra.nombreExtra} ·{' '}
                    {formatCurrency(extra.subtotal)}
                  </span>
                ))}
              </div>
            )}

            {producto.notas && (
              <span className="break-words text-xs text-[var(--muted)] [overflow-wrap:anywhere]">
                Nota: {producto.notas}
              </span>
            )}
          </div>
        </div>

        <strong className="shrink-0 whitespace-nowrap text-sm text-[var(--text)]">
          {formatCurrency(producto.subtotal)}
        </strong>
      </div>
    </div>
  );
}
