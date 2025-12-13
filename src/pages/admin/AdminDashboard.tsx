import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDoctores } from '@/hooks/useDoctores';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useTodasLasCitas } from '@/hooks/useCitas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  Users,
  Stethoscope,
  Calendar,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Activity,
} from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuth();
  const { doctores, isLoading: loadingDoctores } = useDoctores();
  const { pacientes, isLoading: loadingUsuarios } = useUsuarios();
  const { citas, isLoading: loadingCitas } = useTodasLasCitas();

  const citasHoy = citas.filter(c => {
    if (!c.fecha) return false;
    const citaDate = new Date(c.fecha).toDateString();
    return citaDate === new Date().toDateString();
  });

  const citasPendientes = citas.filter(c => c.estado === 'PENDIENTE');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Panel de Administración
          </h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido, {user?.nombres}. Gestiona la clínica desde aquí.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-primary-light to-card border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Doctores</p>
                  {loadingDoctores ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground mt-1">{doctores.length}</p>
                  )}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Stethoscope className="w-7 h-7 text-primary" />
                </div>
              </div>
              <Button variant="ghost" size="sm" className="mt-4 -ml-2" asChild>
                <Link to="/admin/doctores">
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-info/10 to-card border-info/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pacientes</p>
                  {loadingUsuarios ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground mt-1">{pacientes.length}</p>
                  )}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-info/20 flex items-center justify-center">
                  <Users className="w-7 h-7 text-info" />
                </div>
              </div>
              <Button variant="ghost" size="sm" className="mt-4 -ml-2" asChild>
                <Link to="/admin/pacientes">
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-card border-success/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Citas Hoy</p>
                  {loadingCitas ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground mt-1">{citasHoy.length}</p>
                  )}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-success/20 flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-success" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-success" />
                <span>{citasPendientes.length} pendientes</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-card border-warning/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Citas</p>
                  {loadingCitas ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground mt-1">{citas.length}</p>
                  )}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-warning/20 flex items-center justify-center">
                  <Activity className="w-7 h-7 text-warning" />
                </div>
              </div>
              <Button variant="ghost" size="sm" className="mt-4 -ml-2" asChild>
                <Link to="/admin/reportes">
                  Ver reportes
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="w-5 h-5 text-primary" />
                Gestión de Doctores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Administra los doctores de la clínica, sus especialidades y disponibilidad.
              </p>
              <Button variant="outline" asChild>
                <Link to="/admin/doctores">
                  Ir a Doctores
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-info" />
                Gestión de Pacientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Visualiza y administra la información de los pacientes registrados.
              </p>
              <Button variant="outline" asChild>
                <Link to="/admin/pacientes">
                  Ir a Pacientes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-success" />
                Reportes y Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Consulta reportes de citas por doctor, estadísticas y métricas.
              </p>
              <Button variant="outline" asChild>
                <Link to="/admin/reportes">
                  Ver Reportes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
