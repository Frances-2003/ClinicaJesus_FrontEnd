import { useState, useEffect, useCallback } from 'react';
import type { Doctor } from '@/types';
import { api } from '@/services/api';

export function useDoctores() {
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
console.log({doctores});

  const fetchDoctores = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getDoctores();
      setDoctores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar doctores');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctores();
  }, [fetchDoctores]);

  return { doctores, isLoading, error, refetch: fetchDoctores };
}

export function useDoctoresPorEspecialidad(especialidadId: number | null) {
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctores = useCallback(async () => {
    if (!especialidadId) {
      setDoctores([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getDoctoresPorEspecialidad(especialidadId);
      setDoctores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar doctores');
    } finally {
      setIsLoading(false);
    }
  }, [especialidadId]);

  useEffect(() => {
    fetchDoctores();
  }, [fetchDoctores]);

  return { doctores, isLoading, error, refetch: fetchDoctores };
}
