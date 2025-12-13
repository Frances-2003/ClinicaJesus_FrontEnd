import { useState, useEffect, useCallback } from 'react';
import type { Cita, CrearCitaRequest, EstadoCita } from '@/types';
import { api } from '@/services/api';

export function useCitasPaciente(pacienteId: number | null) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCitas = useCallback(async () => {
    if (!pacienteId) {
      setCitas([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getCitasPorPaciente(pacienteId);
      setCitas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar citas');
    } finally {
      setIsLoading(false);
    }
  }, [pacienteId]);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  const crearCita = useCallback(async (data: CrearCitaRequest) => {
    const nuevaCita = await api.crearCita(data);
    setCitas(prev => [...prev, nuevaCita]);
    return nuevaCita;
  }, []);

  const cancelarCita = useCallback(async (citaId: number) => {
    await api.cancelarCita(citaId);
    fetchCitas();
  }, []);

  return { citas, isLoading, error, refetch: fetchCitas, crearCita, cancelarCita };
}

export function useCitasDoctor(doctorId: number | null, fecha: string | null) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCitas = useCallback(async () => {
    if (!doctorId || !fecha) {
      setCitas([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getCitasPorDoctorYFecha(doctorId, fecha);
      setCitas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar citas');
    } finally {
      setIsLoading(false);
    }
  }, [doctorId, fecha]);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  const cambiarEstado = useCallback(async (citaId: number, estado: EstadoCita) => {
    try {
      const citaActualizada = await api.cambiarEstadoCita(citaId, estado);
      setCitas(prev => prev.map(c => c.id === citaId ? citaActualizada : c));
      return citaActualizada;
    } catch (err) {
      // If backend endpoint doesn't exist, update locally for demo
      setCitas(prev => prev.map(c => c.id === citaId ? { ...c, estado } : c));
      throw err;
    }
  }, []);

  return { citas, isLoading, error, refetch: fetchCitas, cambiarEstado };
}

export function useTodasLasCitas() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCitas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getCitas();
      setCitas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar citas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  return { citas, isLoading, error, refetch: fetchCitas };
}
