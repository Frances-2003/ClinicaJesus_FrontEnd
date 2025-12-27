import type {
  Usuario,
  LoginRequest,
  RegistroRequest,
  Especialidad,
  Doctor,
  HorarioDisponible,
  Cita,
  CrearCitaRequest,
  EstadoCita,
} from '@/types';

const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        // Si el backend devuelve un objeto con 'message' o 'error', úsalo
        if (errorData.message) errorMessage = errorData.message;
        else if (errorData.error) errorMessage = errorData.error;
        else if (typeof errorData === 'string') errorMessage = errorData;
      } catch (e) {
        // Si no es JSON, intentamos obtener el texto
        const textError = await response.text();
        if (textError) {
          // Si es un error HTML largo (común en 500s de Spring/Tomcat), mostramos mensaje genérico
          if (textError.trim().startsWith('<!doctype html') || textError.trim().startsWith('<html')) {
            errorMessage = 'Ocurrió un error inesperado en el servidor. Por favor intente más tarde.';
          } else {
            errorMessage = textError;
          }
        }
      }
      throw new Error(errorMessage);
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<Usuario> {
    return this.request<Usuario>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async registro(data: RegistroRequest): Promise<Usuario> {
    return this.request<Usuario>('/usuarios/registro', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Especialidades
  async getEspecialidades(): Promise<Especialidad[]> {
    return this.request<Especialidad[]>('/especialidades');
  }

  async getEspecialidadesActivas(): Promise<Especialidad[]> {
    return this.request<Especialidad[]>('/especialidades/activas');
  }

  async crearEspecialidad(data: Omit<Especialidad, 'id'>): Promise<Especialidad> {
    return this.request<Especialidad>('/especialidades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async actualizarEspecialidad(id: number, data: Omit<Especialidad, 'id'>): Promise<Especialidad> {
    return this.request<Especialidad>(`/especialidades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Doctores
  async getDoctores(): Promise<Doctor[]> {
    return this.request<Doctor[]>('/doctores');
  }

  async getDoctoresPorEspecialidad(especialidadId: number): Promise<Doctor[]> {
    return this.request<Doctor[]>(`/doctores/por-especialidad?especialidadId=${especialidadId}`);
  }

  async crearDoctor(data: { usuarioId: number; especialidadId: number; numeroCmp: string }): Promise<Doctor> {
    return this.request<Doctor>('/doctores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async actualizarDoctor(doctorId: number, data: { especialidadId?: number; numeroCmp?: string }): Promise<Doctor> {
    return this.request<Doctor>(`/doctores/${doctorId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Horarios
  async getHorarios(): Promise<HorarioDisponible[]> {
    return this.request<HorarioDisponible[]>('/horarios');
  }

  async getHorariosDoctor(doctorId: number, fecha?: string): Promise<HorarioDisponible[]> {
    // Si no hay fecha, obtener todos los horarios (usando el endpoint general y filtrando)
    if (!fecha) {
      const allHorarios = await this.request<HorarioDisponible[]>('/horarios');
      return allHorarios.filter(h => h.doctorId === doctorId);
    }
    // Si hay fecha, usar el endpoint específico
    return this.request<HorarioDisponible[]>(`/horarios/por-doctor-y-fecha?doctorId=${doctorId}&fecha=${fecha}`);
  }

  async crearHorario(data: {
    doctorId: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    activo?: boolean;
  }): Promise<HorarioDisponible> {
    return this.request<HorarioDisponible>('/horarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async actualizarHorario(id: number, data: {
    doctorId?: number;
    fecha?: string;
    horaInicio?: string;
    horaFin?: string;
    activo?: boolean;
  }): Promise<HorarioDisponible> {
    return this.request<HorarioDisponible>(`/horarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async eliminarHorario(id: number): Promise<void> {
    return this.request<void>(`/horarios/${id}`, {
      method: 'DELETE',
    });
  }

  async getHorariosPorDoctorYFecha(doctorId: number, fecha: string): Promise<HorarioDisponible[]> {
    return this.request<HorarioDisponible[]>(`/horarios/por-doctor-y-fecha?doctorId=${doctorId}&fecha=${fecha}`);
  }

  // Citas
  async getCitas(): Promise<Cita[]> {
    return this.request<Cita[]>('/citas');
  }

  async getCitasPorPaciente(pacienteId: number): Promise<Cita[]> {
    return this.request<Cita[]>(`/citas/por-paciente?pacienteId=${pacienteId}`);
  }

  async getCitasPorDoctorYFecha(doctorId: number, fecha: string): Promise<Cita[]> {
    return this.request<Cita[]>(`/citas/por-doctor-y-fecha?doctorId=${doctorId}&fecha=${fecha}`);
  }

  async crearCita(data: CrearCitaRequest): Promise<Cita> {
    return this.request<Cita>('/citas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelarCita(citaId: number): Promise<void> {
    await this.request<void>(`/citas/${citaId}/cancelar`, { method: 'POST' });
  }

  async cambiarEstadoCita(citaId: number, estado: EstadoCita): Promise<Cita> {
    return this.request<Cita>(`/citas/${citaId}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    });
  }

  // Usuarios (for admin)
  async getUsuarios(): Promise<Usuario[]> {
    return this.request<Usuario[]>('/usuarios');
  }

  async actualizarRol(usuarioId: number, nuevoRol: 'DOCTOR' | 'ADMIN' | 'PACIENTE'): Promise<Usuario> {
    return this.request<Usuario>(`/usuarios/${usuarioId}/rol`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rol: nuevoRol }),
    });
  }

  async actualizarUsuario(usuarioId: number, data: Partial<Omit<Usuario, 'id' | 'rol'>>): Promise<Usuario> {
    return this.request<Usuario>(`/usuarios/${usuarioId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
