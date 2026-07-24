import { Card } from '../components/ui/Card'

export function AgendarVisitaPage() {

 return (
    <main className="content">
      <div className="stack mx-auto max-w-3xl">
        <section className="stack">
          <div>
            <p className="eyebrow">Nia</p>
            <h1 className="m-0 text-3xl font-bold text-[var(--text)]">
              Nia - Negocio Inteligente Automatizado
            </h1>
          </div>

          <Card className="stack text-sm leading-7 text-[var(--text)] sm:text-base">
            <p>
              Nia es una herramienta digital disenada para apoyar a restaurantes
              en la gestion de pedidos, conversaciones y atencion de clientes a
              traves de WhatsApp y canales digitales asociados.
            </p>

            <section className="stack compact">
              <h2 className="m-0 text-xl font-semibold text-[var(--text)]">
                Contacto:
              </h2>

              <p className="m-0 text-[var(--muted)]">
                Puede enviar un correo a:{' '}
                <a
                  className="font-medium text-[var(--text)] underline underline-offset-4"
                  href="mailto:nixoncortes1@gmail.com"
                >
                  nixoncortes1@gmail.com
                </a>
              </p>
               <p className="m-0 text-[var(--muted)]">
                Puede contactarse al telefono celular: 
                <a
                  className="font-medium text-[var(--text)] underline underline-offset-4"
                >
                  +57 3183551027
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
