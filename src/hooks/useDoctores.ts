import { useQuery } from '@tanstack/react-query';
import type { Doctor } from '@/types';
import { api } from '@/services/api';

export function useDoctores() {
  const { data: doctores = [], isLoading, error, refetch } = useQuery({
    queryKey: ['doctores'],
    queryFn: () => api.getDoctores(),
  });

  return {
    doctores,
    isLoading,
    error: error?.message || null,
    refetch
  };
}

export function useDoctoresPorEspecialidad(especialidadId: number | null) {
  const { data: doctores = [], isLoading, error, refetch } = useQuery({
    queryKey: ['doctores', 'especialidad', especialidadId],
    queryFn: () => api.getDoctoresPorEspecialidad(especialidadId!),
    enabled: especialidadId !== null,
  });

  return {
    doctores,
    isLoading,
    error: error?.message || null,
    refetch
  };
}
