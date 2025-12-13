import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCitasPaciente } from '@/hooks/useCitas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  CalendarPlus,
  Clock,
  Stethoscope,
  User,
  FileText,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format, parseISO, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Cita, EstadoCita } from '@/types';

type FilterType = 'todas' | EstadoCita;

export function MisCitas() {
  const { user } = useAuth();
  const { citas, isLoading, cancelarCita } = useCitasPaciente(user?.id || null);
  const { toast } = useToast();
  const [filter, setFilter] = useState<FilterType>('todas');
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  const filteredCitas = filter === 'todas' 
    ? citas 
    : citas.filter(c => c.estado === filter);

  const handleCancelar = async (citaId: number) => {
    setCancelingId(citaId);
    try {
      await cancelarCita(citaId);
      toast({
        title: 'Cita cancelada',
        description: 'Tu cita ha sido cancelada correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cancelar la cita',
        variant: 'destructive',
      });
    } finally {
      setCancelingId(null);
    }
  };

  const canCancel = (cita: Cita) => {
    if (cita.estado !== 'PENDIENTE' && cita.estado !== 'CONFIRMADA') return false;
    if (!cita.fecha) return true;
    return isAfter(parseISO(cita.fecha), new Date());
  };

  const filters: { value: FilterType; label: string; count: number }[] = [
    { value: 'todas', label: 'Todas', count: citas.length },
    { value: 'PENDIENTE', label: 'Pendientes', count: citas.filter(c => c.estado === 'PENDIENTE').length },
    { value: 'CONFIRMADA', label: 'Confirmadas', count: citas.filter(c => c.estado === 'CONFIRMADA').length },
    { value: 'ATENDIDA', label: 'Atendidas', count: citas.filter(c => c.estado === 'ATENDIDA').length },
    { value: 'CANCELADA', label: 'Canceladas', count: citas.filter(c => c.estado === 'CANCELADA').length },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mis Citas</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona y visualiza todas tus citas médicas
            </p>
          </div>
          <Button size="lg" asChild>
            <Link to="/paciente/reservar">
              <CalendarPlus className="w-5 h-5 mr-2" />
              Nueva Cita
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-background/20 text-xs">
                {f.count}
              </span>
            </Button>
          ))}
        </div>

        {/* Citas List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredCitas.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-8 h-8" />}
            title={filter === 'todas' ? 'No tienes citas' : `No hay citas ${filter.toLowerCase()}s`}
            description="Reserva una cita para comenzar a cuidar tu salud."
            action={
              <Button asChild>
                <Link to="/paciente/reservar">Reservar Cita</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4">
            {filteredCitas.map((cita) => (
              <Card key={cita.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Date Section */}
                    <div className="lg:w-48 p-6 bg-primary-light flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r border-primary/20">
                      <Calendar className="w-6 h-6 text-primary mb-2" />
                      <p className="text-lg font-bold text-foreground">
                        {cita.fecha && format(parseISO(cita.fecha), "d MMM", { locale: es })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {cita.fecha && format(parseISO(cita.fecha), "yyyy", { locale: es })}
                      </p>
                      <p className="text-sm font-medium text-primary mt-1">
                        {cita.hora || cita.horarioDisponible?.horaInicio}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {cita.especialidad?.nombre || 'Consulta Médica'}
                            </h3>
                            <StatusBadge estado={cita.estado} />
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              Dr. {cita.doctor?.usuario?.nombres} {cita.doctor?.usuario?.apellidos}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {cita.hora || cita.horarioDisponible?.horaInicio} - {cita.horarioDisponible?.horaFin}
                            </span>
                          </div>

                          {cita.motivoConsulta && (
                            <div className="flex items-start gap-2 text-sm">
                              <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <p className="text-muted-foreground">{cita.motivoConsulta}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {cita.precio && (
                            <p className="text-lg font-bold text-foreground">
                              S/ {cita.precio.toFixed(2)}
                            </p>
                          )}
                          
                          {canCancel(cita) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={cancelingId === cita.id}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Cancelar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-destructive" />
                                    ¿Cancelar esta cita?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. La cita quedará marcada como cancelada.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>No, mantener</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelar(cita.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Sí, cancelar cita
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
