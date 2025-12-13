import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDoctores } from '@/hooks/useDoctores';
import { useEspecialidades } from '@/hooks/useEspecialidades';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Stethoscope,
  User,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export function Doctores() {
  const { doctores, isLoading } = useDoctores();
  const { especialidades } = useEspecialidades(false);

  const getEspecialidadNombre = (espId: number) => {
    return especialidades.find(e => e.id === espId)?.nombre || 'Sin especialidad';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Doctores</h1>
          <p className="text-muted-foreground mt-1">
            Administra los doctores registrados en la clínica
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              Lista de Doctores ({doctores.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : doctores.length === 0 ? (
              <EmptyState
                icon={<Stethoscope className="w-8 h-8" />}
                title="No hay doctores registrados"
                description="Aún no se han registrado doctores en el sistema."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Especialidad</TableHead>
                      <TableHead>CMP</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctores.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                Dr. {doctor.usuario?.nombres} {doctor.usuario?.apellidos}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                @{doctor.usuario?.username}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {doctor.especialidad?.nombre || getEspecialidadNombre(doctor.especialidadId)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{doctor.numeroCmp}</span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {doctor.usuario?.email}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {doctor.usuario?.telefono || '-'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {doctor.activo !== false ? (
                            <div className="flex items-center gap-1 text-success">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-sm">Activo</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-destructive">
                              <XCircle className="w-4 h-4" />
                              <span className="text-sm">Inactivo</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
