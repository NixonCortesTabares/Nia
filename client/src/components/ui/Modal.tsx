import type { ReactNode } from 'react'
import { Button } from './Button'

type ModalProps = {
  title: string
  children: ReactNode
  onClose: () => void
}

export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <h2>{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Cerrar">x</Button>
        </header>
        {children}
      </section>
    </div>
  )
}
