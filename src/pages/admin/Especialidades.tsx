import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useEspecialidades } from '@/hooks/useEspecialidades';
import { EspecialidadDialog } from '@/components/admin/EspecialidadDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
    Search,
    CheckCircle2,
    XCircle,
} from 'lucide-react';

export function Especialidades() {
    const { especialidades, isLoading, refetch } = useEspecialidades(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEspecialidades = especialidades.filter(esp => {
        const term = searchTerm.toLowerCase();
        return esp.nombre.toLowerCase().includes(term);
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(price);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Gestión de Especialidades</h1>
                        <p className="text-muted-foreground mt-1">
                            Administra las especialidades médicas disponibles en la clínica
                        </p>
                    </div>
                    <EspecialidadDialog onSuccess={refetch} trigger="button" />
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <CardTitle className="flex items-center gap-2">
                                <Stethoscope className="w-5 h-5 text-primary" />
                                Especialidades ({especialidades.length})
                            </CardTitle>
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar especialidad..."
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
                        ) : filteredEspecialidades.length === 0 ? (
                            <EmptyState
                                icon={<Stethoscope className="w-8 h-8" />}
                                title="No se encontraron especialidades"
                                description={searchTerm ? "Intenta con otros términos de búsqueda" : "No hay especialidades registradas"}
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Especialidad</TableHead>
                                            <TableHead>Precio Consulta</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredEspecialidades.map((especialidad) => (
                                            <TableRow key={especialidad.id}>
                                                <TableCell className="font-mono text-sm">
                                                    {especialidad.id}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                            <Stethoscope className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <span className="font-semibold">
                                                            {especialidad.nombre}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-semibold text-primary">
                                                        {formatPrice(especialidad.precioConsulta)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {especialidad.activo !== false ? (
                                                        <Badge variant="default" className="gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Activa
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="gap-1">
                                                            <XCircle className="w-3 h-3" />
                                                            Inactiva
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <EspecialidadDialog
                                                        especialidad={especialidad}
                                                        onSuccess={refetch}
                                                        trigger="edit"
                                                    />
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
