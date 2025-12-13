import { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDoctores } from '@/hooks/useDoctores';
import { useTodasLasCitas } from '@/hooks/useCitas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Calendar,
  Clock,
  Stethoscope,
} from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['hsl(175, 60%, 40%)', 'hsl(200, 70%, 45%)', 'hsl(15, 85%, 55%)', 'hsl(40, 90%, 50%)', 'hsl(150, 60%, 45%)'];

export function Reportes() {
  const { doctores, isLoading: loadingDoctores } = useDoctores();
  const { citas, isLoading: loadingCitas } = useTodasLasCitas();

  const isLoading = loadingDoctores || loadingCitas;

  // Citas por doctor
  const citasPorDoctor = useMemo(() => {
    const counts: Record<number, { nombre: string; total: number; horas: number }> = {};
    
    doctores.forEach(doc => {
      counts[doc.id] = {
        nombre: `Dr. ${doc.usuario?.nombres || ''} ${doc.usuario?.apellidos || ''}`.trim() || `Doctor ${doc.id}`,
        total: 0,
        horas: 0,
      };
    });

    citas.forEach(cita => {
      const doctorId = cita.doctor?.id || cita.horarioDisponible?.doctorId;
      if (doctorId && counts[doctorId]) {
        counts[doctorId].total += 1;
        counts[doctorId].horas += 0.5; // Each slot is 30 min
      }
    });

    return Object.values(counts).filter(d => d.total > 0);
  }, [doctores, citas]);

  // Citas por estado
  const citasPorEstado = useMemo(() => {
    const estados = { PENDIENTE: 0, CONFIRMADA: 0, ATENDIDA: 0, CANCELADA: 0 };
    citas.forEach(c => {
      if (estados[c.estado] !== undefined) {
        estados[c.estado]++;
      }
    });
    return [
      { name: 'Pendientes', value: estados.PENDIENTE, color: 'hsl(40, 90%, 50%)' },
      { name: 'Confirmadas', value: estados.CONFIRMADA, color: 'hsl(200, 80%, 50%)' },
      { name: 'Atendidas', value: estados.ATENDIDA, color: 'hsl(150, 60%, 45%)' },
      { name: 'Canceladas', value: estados.CANCELADA, color: 'hsl(0, 70%, 55%)' },
    ].filter(e => e.value > 0);
  }, [citas]);

  // Citas por día de la semana actual
  const citasSemana = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map(day => {
      const citasDelDia = citas.filter(c => {
        if (!c.fecha) return false;
        const citaDate = parseISO(c.fecha);
        return format(citaDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });
      return {
        dia: format(day, 'EEE', { locale: es }),
        fecha: format(day, 'd/M'),
        citas: citasDelDia.length,
      };
    });
  }, [citas]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes y Estadísticas</h1>
          <p className="text-muted-foreground mt-1">
            Visualiza métricas y estadísticas de la clínica
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">{citas.length}</p>
                      <p className="text-sm text-muted-foreground">Total de Citas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">
                        {(citas.length * 0.5).toFixed(1)}h
                      </p>
                      <p className="text-sm text-muted-foreground">Horas de Consulta</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-info/20 flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-info" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">{doctores.length}</p>
                      <p className="text-sm text-muted-foreground">Doctores Activos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Citas por día */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Citas esta Semana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={citasSemana}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="dia" 
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis 
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar 
                          dataKey="citas" 
                          fill="hsl(175, 60%, 40%)" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Citas por estado */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Distribución por Estado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={citasPorEstado}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {citasPorEstado.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Table: Citas por Doctor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  Citas por Doctor
                </CardTitle>
              </CardHeader>
              <CardContent>
                {citasPorDoctor.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay datos de citas por doctor disponibles.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead className="text-center">Total Citas</TableHead>
                        <TableHead className="text-center">Horas de Consulta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {citasPorDoctor.map((doc, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{doc.nombre}</TableCell>
                          <TableCell className="text-center">
                            <span className="font-bold text-foreground">{doc.total}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-bold text-primary">{doc.horas}h</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
