import { useState, useEffect, useCallback } from 'react';
import type { Usuario } from '@/types';
import { api } from '@/services/api';

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const pacientes = usuarios.filter(u => u.rol === 'PACIENTE');

  return { usuarios, pacientes, isLoading, error, refetch: fetchUsuarios };
}
