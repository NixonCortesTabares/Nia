import { Card } from '../components/ui/Card'

export function PrivacidadPage() {
  return (
    <main className="content">
      <div className="stack mx-auto max-w-3xl">
        <section className="stack">
          <div>
            <p className="eyebrow">Nia</p>
            <h1 className="m-0 text-3xl font-bold text-[var(--text)]">
              Política de Privacidad
            </h1>
          </div>

          <Card className="stack text-sm leading-7 text-[var(--text)] sm:text-base">
            <p>
              Nia es una herramienta digital que permite a restaurantes
              gestionar pedidos y conversaciones realizadas por WhatsApp.
            </p>

            <section className="stack compact">
              <h2 className="m-0 text-xl font-semibold text-[var(--text)]">
                Datos que se pueden tratar
              </h2>

              <ul className="m-0 grid gap-2 pl-5 text-[var(--muted)]">
                <li>Nombre del cliente.</li>
                <li>Número de teléfono.</li>
                <li>
                  Dirección de entrega, cuando el pedido sea a domicilio.
                </li>
                <li>
                  Mensajes relacionados con la toma y confirmación del pedido.
                </li>
                <li>
                  Información del pedido, como productos, extras, método de
                  pago, estado y fecha.
                </li>
              </ul>
            </section>

            <section className="stack compact">
              <h2 className="m-0 text-xl font-semibold text-[var(--text)]">
                Finalidad
              </h2>

              <p className="m-0 text-[var(--muted)]">
                Los datos se usan únicamente para gestionar pedidos, permitir la
                comunicación entre el cliente y el restaurante, dar seguimiento
                al estado del pedido y mejorar la operación del negocio.
              </p>
            </section>

            <section className="stack compact">
              <h2 className="m-0 text-xl font-semibold text-[var(--text)]">
                Conservación
              </h2>

              <p className="m-0 text-[var(--muted)]">
                Los datos se conservan mientras sean necesarios para la
                operación del servicio, atención de solicitudes, seguridad,
                soporte o cumplimiento de obligaciones legales o contractuales.
              </p>
            </section>

            <section className="stack compact">
              <h2 className="m-0 text-xl font-semibold text-[var(--text)]">
                No venta de datos
              </h2>

              <p className="m-0 text-[var(--muted)]">
                Nia no vende datos personales a terceros.
              </p>
            </section>

            <section className="stack compact">
              <h2 className="m-0 text-xl font-semibold text-[var(--text)]">
                Contacto
              </h2>

              <p className="m-0 text-[var(--muted)]">
                Para consultas sobre privacidad, actualización o eliminación de
                datos, el usuario puede escribir a:{' '}
                <a
                  className="font-medium text-[var(--text)] underline underline-offset-4"
                  href="mailto:nixoncortes1@gmail.com"
                >
                  nixoncortes1@gmail.com
                </a>
              </p>
            </section>

            <p className="m-0 text-sm text-[var(--muted)]">
              Última actualización: Junio de 2026.
            </p>
          </Card>
        </section>
      </div>
    </main>
  )
}
