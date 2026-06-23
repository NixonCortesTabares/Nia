import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { obtenerMenuPublico, type MenuPublico } from '../api/menuApi';
import { getApiErrorMessage } from '../api/apiClient';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function getSlugFromPath() {
  const path = window.location.pathname;

  return decodeURIComponent(path.replace('/menu/', '').split('/')[0] ?? '');
}

export function MenuPublicoPage() {
  const [menu, setMenu] = useState<MenuPublico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const slug = getSlugFromPath();

  useEffect(() => {
    async function cargarMenu() {
      try {
        setLoading(true);
        setError('');

        if (!slug) {
          setError('No se encontró el menú solicitado.');
          return;
        }

        const response = await obtenerMenuPublico(slug);
        setMenu(response.menu);
      } catch (error) {
        setError(getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    cargarMenu();
  }, [slug]);

  if (loading) {
    return (
      <main className="auth-page">
        <Card>
          <p>Cargando menú...</p>
        </Card>
      </main>
    );
  }

  if (error || !menu) {
    return (
      <main className="auth-page">
        <Card>
          <h2>Menú no disponible</h2>
          <p>{error || 'No se pudo cargar el menú.'}</p>
        </Card>
      </main>
    );
  }

  return (
  <main className="content">
    <div className="stack">
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <p className="eyebrow">Menú digital</p>

        <div className="mt-1 flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--text)]">
            {menu.negocio.nombre}
          </h1>

          <span className="text-sm text-[var(--muted)]">
            Productos disponibles para pedidos por WhatsApp.
          </span>
        </div>
      </section>

      {menu.categorias.map((categoria) => (
        <section key={categoria.nombre} className="stack">
          <div className="section-header border-b border-[var(--border)] pb-2">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text)]">
                {categoria.nombre}
              </h2>

              <span className="text-sm text-[var(--muted)]">
                {categoria.productos.length} producto
                {categoria.productos.length === 1 ? '' : 's'} disponible
                {categoria.productos.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {categoria.productos.length === 0 ? (
            <Card>
              <p>No hay productos disponibles en esta categoría.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {categoria.productos.map((producto) => (
                <Card
                  key={`${categoria.nombre}-${producto.nombre}`}
                  className="transition hover:border-[var(--strong-border)]"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="grid gap-2">
                      <h3 className="!m-0 text-2xl font-bold leading-tight text-[var(--text)]">
                        {producto.nombre}
                      </h3>

                      {producto.descripcion && (
                        <span className="text-sm leading-relaxed text-[var(--muted)]">
                          {producto.descripcion}
                        </span>
                      )}

                      {producto.ingredientes && (
                        <span className="text-xs leading-relaxed text-[var(--muted)]">
                          {producto.ingredientes}
                        </span>
                      )}
                    </div>

                    <div className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-right">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                        Precio
                      </span>

                      <strong className="block text-2xl font-bold text-[var(--text)]">
                        {formatCurrency(producto.valor)}
                      </strong>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {categoria.extras.length > 0 && (
            <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div>
                <h3 className="!m-0 text-lg font-bold text-[var(--text)]">
                  Extras disponibles
                </h3>

                <span className="text-sm text-[var(--muted)]">
                  Puedes agregarlos según disponibilidad del restaurante.
                </span>
              </div>

              <div className="chip-list">
                {categoria.extras.map((extra) => (
                  <span
                    key={`${categoria.nombre}-${extra.nombre}`}
                    className="chip"
                  >
                    {extra.nombre} · {formatCurrency(extra.valor)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  </main>
)
}