// User and Auth types
export type UserRole = 'PACIENTE' | 'DOCTOR' | 'ADMIN';

export interface Usuario {
  id: number;
  username: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  rol: UserRole;
  activo: boolean;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegistroRequest {
  username: string;
  password: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
}

// Especialidad
export interface Especialidad {
  id: number;
  nombre: string;
  precioConsulta: number;
  activo?: boolean;
}

// Doctor
export interface Doctor {
  id: number;
  usuarioId: number;
  nombres: string;
  apellidos: string;
  email: string;
  especialidadId: number;
  especialidadNombre: string;
  especialidadPrecioConsulta: number;
  numeroCmp: string;
  activo: boolean;
}

// Horario
export interface HorarioDisponible {
  id: number;
  doctorId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  activo?: boolean;
  doctor?: Doctor;
}

// Cita
export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'ATENDIDA';

export interface Cita {
  id: number;
  pacienteId: number;
  horarioDisponibleId: number;
  motivoConsulta: string;
  notasAdicionales?: string;
  estado: EstadoCita;
  precio?: number;
  paciente?: Usuario;
  horarioDisponible?: HorarioDisponible;
  doctor?: Doctor;
  especialidad?: Especialidad;
  fecha?: string;
  hora?: string;
}

export interface CrearCitaRequest {
  pacienteId: number;
  horarioDisponibleId: number;
  motivoConsulta: string;
  notasAdicionales?: string;
}

// API Response types
export interface ApiError {
  message: string;
  status?: number;
}
