import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useDoctores } from '@/hooks/useDoctores';
import { RegistrarHorarioDialog } from '@/components/doctor/RegistrarHorarioDialog';
import { EditarHorarioDialog } from '@/components/doctor/EditarHorarioDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, LoadingPage } from '@/components/common/LoadingSpinner';
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
    Clock,
    Calendar,
    CheckCircle2,
    XCircle,
    Trash2,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import type { Doctor, HorarioDisponible } from '@/types';

export function Horarios() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { doctores, isLoading: loadingDoctores } = useDoctores();
    const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
    const [horarios, setHorarios] = useState<HorarioDisponible[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Find doctor profile by user id
    useEffect(() => {
        if (doctores.length > 0 && user) {
            const doc = doctores.find(d => d.usuarioId === user.id);
            if (doc) setDoctorProfile(doc);
        }
    }, [doctores, user]);

    // Fetch horarios
    useEffect(() => {
        const fetchHorarios = async () => {
            if (!doctorProfile) return;
            setIsLoading(true);
            try {
                const data = await api.getHorariosDoctor(doctorProfile.id);
                setHorarios(data);
            } catch (error) {
                console.error('Error fetching horarios:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHorarios();
    }, [doctorProfile]);

    const refetchHorarios = async () => {
        if (!doctorProfile) return;
        try {
            const data = await api.getHorariosDoctor(doctorProfile.id);
            setHorarios(data);
        } catch (error) {
            console.error('Error refetching horarios:', error);
        }
    };

    const handleEliminar = async (id: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este horario?')) return;

        try {
            await api.eliminarHorario(id);
            toast({
                title: 'Horario eliminado',
                description: 'El horario ha sido eliminado correctamente.',
            });
            refetchHorarios();
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Error al eliminar horario',
                variant: 'destructive',
            });
        }
    };

    if (loadingDoctores) return <DashboardLayout><LoadingPage /></DashboardLayout>;

    if (!doctorProfile) {
        return (
            <DashboardLayout>
                <EmptyState
                    icon={<Clock className="w-8 h-8" />}
                    title="Perfil de doctor no encontrado"
                    description="No se encontró un perfil de doctor asociado a tu cuenta."
                />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Mis Horarios</h1>
                        <p className="text-muted-foreground mt-1">
                            Gestiona tu disponibilidad para atender pacientes
                        </p>
                    </div>
                    <RegistrarHorarioDialog doctorId={doctorProfile.id} onSuccess={refetchHorarios} />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Horarios Registrados ({horarios.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <LoadingSpinner />
                            </div>
                        ) : horarios.filter(h => h.activo !== false).length === 0 ? (
                            <EmptyState
                                icon={<Clock className="w-8 h-8" />}
                                title="No hay horarios activos"
                                description="Comienza agregando tu disponibilidad para que los pacientes puedan reservar citas."
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Hora Inicio</TableHead>
                                            <TableHead>Hora Fin</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {horarios.filter(h => h.activo !== false).map((horario) => (
                                            <TableRow key={horario.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                                        <span className="font-medium">
                                                            {format(parseISO(horario.fecha), "EEEE, d 'de' MMMM, yyyy", { locale: es })}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                                        <span>{horario.horaInicio}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                                        <span>{horario.horaFin}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {horario.activo !== false ? (
                                                        <Badge variant="default" className="gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Activo
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive" className="gap-1">
                                                            <XCircle className="w-3 h-3" />
                                                            Inactivo
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <EditarHorarioDialog horario={horario} onSuccess={refetchHorarios} />
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                            onClick={() => handleEliminar(horario.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
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
