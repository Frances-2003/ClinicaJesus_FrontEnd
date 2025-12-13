import { Badge } from '@/components/ui/badge';
import type { EstadoCita } from '@/types';

interface StatusBadgeProps {
  estado: EstadoCita;
}

const estadoLabels: Record<EstadoCita, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  ATENDIDA: 'Atendida',
};

export function StatusBadge({ estado }: StatusBadgeProps) {
  const variant = estado.toLowerCase() as 'pendiente' | 'confirmada' | 'cancelada' | 'atendida';
  
  return (
    <Badge variant={variant}>
      {estadoLabels[estado]}
    </Badge>
  );
}
