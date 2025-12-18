import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCitasPaciente } from '@/hooks/useCitas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import {
  CalendarPlus,
  Calendar,
  Clock,
  Stethoscope,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

export function PacienteDashboard() {
  const { user } = useAuth();
  const { citas, isLoading } = useCitasPaciente(user?.id || null);

  const citasPendientes = citas.filter(c => c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA');
  const proximaCita = citasPendientes
    .filter(c => c.fecha && isAfter(parseISO(c.fecha), new Date()))
    .sort((a, b) => new Date(a.fecha!).getTime() - new Date(b.fecha!).getTime())[0];
  console.log({ proximaCita });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              ¡Hola, {user?.nombres}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Bienvenido a tu panel de paciente. Aquí puedes gestionar tus citas médicas.
            </p>
          </div>
          <Button size="lg" variant="hero" asChild>
            <Link to="/paciente/reservar">
              <CalendarPlus className="w-5 h-5 mr-2" />
              Reservar Nueva Cita
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary-light border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{citasPendientes.length}</p>
                  <p className="text-sm text-muted-foreground">Citas Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-success/10 border-success/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {citas.filter(c => c.estado === 'ATENDIDA').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Citas Atendidas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{citas.length}</p>
                  <p className="text-sm text-muted-foreground">Total de Citas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Appointment */}
        {proximaCita && (
          <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary-light to-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Próxima Cita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-bold text-foreground">
                      {proximaCita.fecha && format(parseISO(proximaCita.fecha), "EEEE, d 'de' MMMM", { locale: es })}
                    </p>
                    <StatusBadge estado={proximaCita.estado} />
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {proximaCita.hora || proximaCita.horarioDisponible?.horaInicio}
                    </span>
                    <span className="flex items-center gap-1">
                      <Stethoscope className="w-4 h-4" />
                      {proximaCita.especialidad?.nombre || 'Especialidad'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dr. {proximaCita.doctor?.nombres} {proximaCita.doctor?.apellidos}
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/paciente/citas">
                    Ver detalles
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Mis Citas Recientes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/paciente/citas">
                Ver todas
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : citas.length === 0 ? (
              <EmptyState
                icon={<Calendar className="w-8 h-8" />}
                title="No tienes citas"
                description="Reserva tu primera cita médica para comenzar."
                action={
                  <Button asChild>
                    <Link to="/paciente/reservar">Reservar Cita</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {citas.slice(0, 5).map((cita) => (
                  <div
                    key={cita.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {cita.especialidad?.nombre || 'Consulta Médica'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {cita.fecha && format(parseISO(cita.fecha), "d MMM yyyy", { locale: es })} - {cita.hora || cita.horarioDisponible?.horaInicio}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge estado={cita.estado} />
                      {cita.precio && (
                        <span className="text-sm font-semibold text-foreground">
                          S/ {cita.precio.toFixed(2)}
                        </span>
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
