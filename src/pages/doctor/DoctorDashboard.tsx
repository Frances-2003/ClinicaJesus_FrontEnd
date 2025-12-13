import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useDoctores } from '@/hooks/useDoctores';
import { useCitasDoctor } from '@/hooks/useCitas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner, LoadingPage } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  Activity,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { EstadoCita, Doctor } from '@/types';
import { cn } from '@/lib/utils';

export function DoctorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { doctores, isLoading: loadingDoctores } = useDoctores();
  
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Find doctor profile by user id
  useEffect(() => {
    if (doctores.length > 0 && user) {
      const doc = doctores.find(d => d.usuarioId === user.id);
      if (doc) setDoctorProfile(doc);
    }
  }, [doctores, user]);

  const { citas, isLoading: loadingCitas, cambiarEstado } = useCitasDoctor(
    doctorProfile?.id || null,
    format(selectedDate, 'yyyy-MM-dd')
  );

  const handleCambiarEstado = async (citaId: number, nuevoEstado: EstadoCita) => {
    try {
      await cambiarEstado(citaId, nuevoEstado);
      toast({
        title: 'Estado actualizado',
        description: `La cita ha sido marcada como ${nuevoEstado.toLowerCase()}`,
      });
    } catch {
      toast({
        title: 'Estado actualizado localmente',
        description: 'El cambio se guardó localmente. El endpoint del backend puede no estar disponible.',
      });
    }
  };

  if (loadingDoctores) return <DashboardLayout><LoadingPage /></DashboardLayout>;

  if (!doctorProfile) {
    return (
      <DashboardLayout>
        <EmptyState
          icon={<User className="w-8 h-8" />}
          title="Perfil de doctor no encontrado"
          description="No se encontró un perfil de doctor asociado a tu cuenta."
        />
      </DashboardLayout>
    );
  }

  const citasPendientes = citas.filter(c => c.estado === 'PENDIENTE');
  const citasConfirmadas = citas.filter(c => c.estado === 'CONFIRMADA');
  const citasAtendidas = citas.filter(c => c.estado === 'ATENDIDA');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Bienvenido, Dr. {user?.nombres}
            </h1>
            <p className="text-muted-foreground mt-1">
              Panel de gestión de citas - {doctorProfile.especialidadNombre || 'Especialidad'}
            </p>
          </div>
          
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="lg" className="w-[240px] justify-start">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {format(selectedDate, "EEEE, d MMM", { locale: es })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={es}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-warning/10 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{citasPendientes.length}</p>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-info/10 border-info/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{citasConfirmadas.length}</p>
                  <p className="text-xs text-muted-foreground">Confirmadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-success/10 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{citasAtendidas.length}</p>
                  <p className="text-xs text-muted-foreground">Atendidas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{citas.length}</p>
                  <p className="text-xs text-muted-foreground">Total hoy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Citas del {format(selectedDate, "d 'de' MMMM", { locale: es })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCitas ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : citas.length === 0 ? (
              <EmptyState
                icon={<CalendarIcon className="w-8 h-8" />}
                title="Sin citas para este día"
                description="No tienes citas programadas para la fecha seleccionada."
              />
            ) : (
              <div className="space-y-4">
                {citas.map((cita) => (
                  <div
                    key={cita.id}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      cita.estado === 'CANCELADA' && "opacity-50",
                      cita.estado === 'ATENDIDA' && "bg-success/5 border-success/20",
                      cita.estado === 'CONFIRMADA' && "bg-info/5 border-info/20",
                      cita.estado === 'PENDIENTE' && "bg-warning/5 border-warning/20"
                    )}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Time */}
                        <div className="text-center min-w-[80px]">
                          <p className="text-lg font-bold text-foreground">
                            {cita.hora || cita.horarioDisponible?.horaInicio}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cita.horarioDisponible?.horaFin}
                          </p>
                        </div>

                        {/* Patient Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <p className="font-semibold text-foreground">
                              {cita.paciente?.nombres} {cita.paciente?.apellidos}
                            </p>
                            <StatusBadge estado={cita.estado} />
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>{cita.paciente?.email}</span>
                            <span>{cita.paciente?.telefono}</span>
                          </div>

                          {cita.motivoConsulta && (
                            <div className="flex items-start gap-2 text-sm">
                              <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <p className="text-muted-foreground">{cita.motivoConsulta}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      {cita.estado !== 'CANCELADA' && cita.estado !== 'ATENDIDA' && (
                        <div className="flex items-center gap-2">
                          <Select
                            value={cita.estado}
                            onValueChange={(value: EstadoCita) => handleCambiarEstado(cita.id, value)}
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                              <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
                              <SelectItem value="ATENDIDA">Atendida</SelectItem>
                              <SelectItem value="CANCELADA">Cancelada</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
