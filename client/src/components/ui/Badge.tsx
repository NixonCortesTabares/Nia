import type { EstadoPedido } from '../../data/mockData'

type BadgeProps = {
  children: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}

const stateTone: Record<EstadoPedido, BadgeProps['tone']> = {
  Pendiente: 'warning',
  'En cocina': 'neutral',
  'En ruta': 'neutral',
  Entregado: 'success',
  Cancelado: 'danger',
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function StatusBadge({ estado }: { estado: EstadoPedido }) {
  return <Badge tone={stateTone[estado]}>{estado}</Badge>
}
