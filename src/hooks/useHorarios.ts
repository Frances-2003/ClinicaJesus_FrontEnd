import { useState, useEffect, useCallback } from 'react';
import type { HorarioDisponible } from '@/types';
import { api } from '@/services/api';

export function useHorariosPorDoctorYFecha(doctorId: number | null, fecha: string | null) {
  const [horarios, setHorarios] = useState<HorarioDisponible[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHorarios = useCallback(async () => {
    if (!doctorId || !fecha) {
      setHorarios([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getHorariosPorDoctorYFecha(doctorId, fecha);
      setHorarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar horarios');
    } finally {
      setIsLoading(false);
    }
  }, [doctorId, fecha]);

  useEffect(() => {
    fetchHorarios();
  }, [fetchHorarios]);

  return { horarios, isLoading, error, refetch: fetchHorarios };
}
