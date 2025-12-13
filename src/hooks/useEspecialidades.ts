import { useState, useEffect, useCallback } from 'react';
import type { Especialidad } from '@/types';
import { api } from '@/services/api';

export function useEspecialidades(soloActivas = true) {
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEspecialidades = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = soloActivas 
        ? await api.getEspecialidadesActivas()
        : await api.getEspecialidades();
      setEspecialidades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar especialidades');
    } finally {
      setIsLoading(false);
    }
  }, [soloActivas]);

  useEffect(() => {
    fetchEspecialidades();
  }, [fetchEspecialidades]);

  return { especialidades, isLoading, error, refetch: fetchEspecialidades };
}
