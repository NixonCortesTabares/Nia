import { Card } from '../components/ui/Card'

export function TerminosPage() {
  return (
    <main className="content">
      <div className="stack mx-auto max-w-3xl">
        <section className="stack">
          <div>
            <p className="eyebrow">Nia</p>
            <h1 className="m-0 text-3xl font-bold text-[var(--text)]">
              Condiciones del Servicio
            </h1>
          </div>

          <Card className="stack text-sm leading-7 text-[var(--text)] sm:text-base">
            <p>
              Nia es una herramienta digital disenada para apoyar a restaurantes
              en la gestion de pedidos, conversaciones y atencion de clientes a
              traves de WhatsApp y canales digitales asociados.
            </p>

            <p className="m-0 text-[var(--muted)]">
              Al utilizar Nia, el usuario entiende que el servicio permite
              automatizar y organizar procesos relacionados con la toma de
              pedidos, consulta de menu, seguimiento de conversaciones y gestion
              operativa del negocio.
            </p>

            <section className="stack compact">
              <h2 className="m-0 text-xl font-semibold text-[var(--text)]">
                Uso del servicio
              </h2>

              <p className="m-0 text-[var(--muted)]">
                Nia debe utilizarse unicamente para fines legales, comerciales y
                operativos relacionados con la atencion de clientes y gestion de
                pedidos. No debe utilizarse para enviar contenido ofensivo,
                fraudulento, ilegal, enganoso o que infrinja derechos de
                terceros.
              </p>
            </section>

            <section className="stack compact">
              <h2 className="m-0 text-xl font-semibold text-[var(--text)]">
                Responsabilidad del negocio
              </h2>

              <p className="m-0 text-[var(--muted)]">
                Cada restaurante o negocio que utiliza Nia es responsable de la
                informacion que configura en la plataforma, incluyendo
                productos, precios, disponibilidad, costos de domicilio,
                horarios, mensajes enviados y condiciones comerciales ofrecidas
                a sus clientes.
              </p>
            </section>

            <section className="stack compact">
              <h2 className="m-0 text-xl font-semibold text-[var(--text)]">
                Pedidos y disponibilidad
              </h2>

              <p className="m-0 text-[var(--muted)]">
                Nia ayuda a gestionar pedidos, pero la preparacion, entrega,
                disponibilidad de productos, tiempos de atencion, calidad del
                servicio y cumplimiento final del pedido son responsabilidad del
                restaurante o negocio correspondiente.
              </p>
            </section>

            <section className="stack compact">
              <h2 className="m-0 text-xl font-semibold text-[var(--text)]">
                Uso de WhatsApp
              </h2>

              <p className="m-0 text-[var(--muted)]">
                Nia puede integrarse con WhatsApp Business Platform para
                facilitar la comunicacion entre clientes y negocios. El uso de
                WhatsApp esta sujeto tambien a las politicas y condiciones
                aplicables de Meta y WhatsApp.
              </p>
            </section>

            <section className="stack compact">
              <h2 className="m-0 text-xl font-semibold text-[var(--text)]">
                Datos personales
              </h2>

              <p className="m-0 text-[var(--muted)]">
                El tratamiento de datos personales se realiza conforme a la
                Politica de Privacidad de Nia, disponible en la ruta
                <span className="font-medium text-[var(--text)]"> /privacidad</span>.
              </p>
            </section>

            <section className="stack compact">
              <h2 className="m-0 text-xl font-semibold text-[var(--text)]">
                Eliminacion de datos
              </h2>

              <p className="m-0 text-[var(--muted)]">
                Los usuarios pueden solicitar la eliminacion de sus datos
                personales siguiendo las instrucciones disponibles en la ruta
                <span className="font-medium text-[var(--text)]"> /eliminacion-datos</span>.
              </p>
            </section>

            <section className="stack compact">
              <h2 className="m-0 text-xl font-semibold text-[var(--text)]">
                Limitacion de responsabilidad
              </h2>

              <p className="m-0 text-[var(--muted)]">
                Nia se ofrece como una herramienta tecnologica de apoyo. No se
                garantiza que el servicio este libre de interrupciones, errores
                o fallas externas causadas por proveedores, servicios de
                terceros, conexion a internet, WhatsApp, Meta, servicios de
                inteligencia artificial u otros sistemas integrados.
              </p>
            </section>

            <section className="stack compact">
              <h2 className="m-0 text-xl font-semibold text-[var(--text)]">
                Cambios en el servicio
              </h2>

              <p className="m-0 text-[var(--muted)]">
                Nia puede actualizar, modificar o mejorar sus funcionalidades,
                condiciones y politicas cuando sea necesario. Las versiones
                actualizadas estaran disponibles publicamente.
              </p>
            </section>

            <section className="stack compact">
              <h2 className="m-0 text-xl font-semibold text-[var(--text)]">
                Contacto
              </h2>

              <p className="m-0 text-[var(--muted)]">
                Para consultas sobre estas condiciones, privacidad o eliminacion
                de datos, puedes escribir a:{' '}
                <a
                  className="font-medium text-[var(--text)] underline underline-offset-4"
                  href="mailto:nixoncortes1@gmail.com"
                >
                  nixoncortes1@gmail.com
                </a>
              </p>
            </section>

            <p className="m-0 text-sm text-[var(--muted)]">
              Ultima actualizacion: Junio de 2026.
            </p>
          </Card>
        </section>
      </div>
    </main>
  )
}
