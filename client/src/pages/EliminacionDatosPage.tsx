import { Card } from '../components/ui/Card'

export function EliminacionDatosPage() {
  return (
    <main className="content">
      <div className="stack mx-auto max-w-3xl">
        <section className="stack">
          <div>
            <p className="eyebrow">Nia</p>
            <h1 className="m-0 text-3xl font-bold text-[var(--text)]">
              Instrucciones para solicitar la eliminación de datos
            </h1>
          </div>

          <Card className="stack text-sm leading-7 text-[var(--text)] sm:text-base">
            <p>
              En Nia tratamos únicamente los datos necesarios para gestionar
              pedidos realizados por WhatsApp, tales como nombre, número de
              teléfono, dirección de entrega, historial de conversación
              relacionado con pedidos y datos del pedido realizado.
            </p>

            <section className="stack compact">
              <h2 className="m-0 text-xl font-semibold text-[var(--text)]">
                Solicitud de eliminación
              </h2>

              <p className="m-0 text-[var(--muted)]">
                Para solicitar la eliminación de datos personales asociados a
                Nia, el usuario puede enviar un correo a:{' '}
                <a
                  className="font-medium text-[var(--text)] underline underline-offset-4"
                  href="mailto:nixoncortes1@gmail.com"
                >
                  nixoncortes1@gmail.com
                </a>
              </p>
            </section>

            <section className="stack compact">
              <h2 className="m-0 text-xl font-semibold text-[var(--text)]">
                Asunto
              </h2>

              <p className="m-0 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 font-medium text-[var(--text)]">
                Solicitud de eliminación de datos - Nia
              </p>
            </section>

            <section className="stack compact">
              <h2 className="m-0 text-xl font-semibold text-[var(--text)]">
                El correo debe incluir
              </h2>

              <ul className="m-0 grid gap-2 pl-5 text-[var(--muted)]">
                <li>Nombre usado en el pedido.</li>
                <li>
                  Número de teléfono asociado a la conversación de WhatsApp.
                </li>
                <li>
                  Nombre del restaurante o negocio con el que realizó el pedido.
                </li>
                <li>
                  Solicitud expresa de eliminación de datos personales.
                </li>
              </ul>
            </section>

            <p className="m-0 text-[var(--muted)]">
              Una vez recibida la solicitud, se revisará la información y se
              eliminarán o anonimizarán los datos personales asociados, salvo
              aquellos que deban conservarse por razones legales, contables,
              contractuales, de seguridad o soporte.
            </p>

            <p className="m-0 text-[var(--muted)]">
              También se puede solicitar actualización, corrección o consulta de
              datos personales escribiendo al mismo correo.
            </p>

            <p className="m-0 text-sm text-[var(--muted)]">
              Última actualización: Junio de 2026.
            </p>
          </Card>
        </section>
      </div>
    </main>
  )
}
