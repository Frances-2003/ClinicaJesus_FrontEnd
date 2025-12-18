import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useUsuarios } from '@/hooks/useUsuarios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Users,
  User,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function Pacientes() {
  const { pacientes, isLoading } = useUsuarios();
  const [searchTerm, setSearchTerm] = useState('');
  console.log({ pacientes });

  const filteredPacientes = pacientes.filter(paciente => {
    const term = searchTerm.toLowerCase();
    return (
      paciente.nombres.toLowerCase().includes(term) ||
      paciente.apellidos.toLowerCase().includes(term) ||
      paciente.email.toLowerCase().includes(term) ||
      paciente.username.toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Pacientes</h1>
          <p className="text-muted-foreground mt-1">
            Visualiza la información de los pacientes registrados
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Lista de Pacientes ({pacientes.length})
              </CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : filteredPacientes.length === 0 ? (
              <EmptyState
                icon={<Users className="w-8 h-8" />}
                title="No se encontraron pacientes"
                description={searchTerm ? "Intenta con otros términos de búsqueda" : "Aún no se han registrado pacientes en el sistema."}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPacientes.map((paciente) => (
                      <TableRow key={paciente.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-info/20 flex items-center justify-center">
                              <User className="w-5 h-5 text-info" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {paciente.nombres} {paciente.apellidos}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                @{paciente.username}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            {paciente.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            {paciente.telefono || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {paciente.activo ? (
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
