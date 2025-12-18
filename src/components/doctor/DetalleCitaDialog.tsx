import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
    User,
    Calendar,
    Clock,
    DollarSign,
    FileText,
    Stethoscope,
    MessageSquare,
    CalendarClock,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Cita } from '@/types';

interface DetalleCitaDialogProps {
    cita: Cita | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DetalleCitaDialog({ cita, open, onOpenChange }: DetalleCitaDialogProps) {
    if (!cita) return null;

    const formatPrice = (price?: number, currency?: string) => {
        if (!price) return 'No especificado';
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: currency || 'PEN',
        }).format(price);
    };

    const formatDateTime = (dateTime?: string) => {
        if (!dateTime) return 'No especificado';
        try {
            return format(parseISO(dateTime), "d 'de' MMMM, yyyy - HH:mm", { locale: es });
        } catch {
            return dateTime;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Detalles de la Cita
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Estado */}
                    <div className="flex items-center justify-between pb-4 border-b">
                        <span className="text-sm font-medium text-muted-foreground">Estado actual</span>
                        <StatusBadge estado={cita.estado} />
                    </div>

                    {/* Paciente */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <User className="w-4 h-4 text-primary" />
                            Información del Paciente
                        </div>
                        <div className="pl-6 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Nombre:</span>
                                <span className="text-sm font-medium">{cita.pacienteNombreCompleto || 'No especificado'}</span>
                            </div>
                            {cita.paciente?.email && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Email:</span>
                                    <span className="text-sm font-medium">{cita.paciente.email}</span>
                                </div>
                            )}
                            {cita.paciente?.telefono && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Teléfono:</span>
                                    <span className="text-sm font-medium">{cita.paciente.telefono}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Doctor */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <User className="w-4 h-4 text-primary" />
                            Información del Doctor
                        </div>
                        <div className="pl-6 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Doctor:</span>
                                <span className="text-sm font-medium">
                                    {cita.doctorNombreCompleto ||
                                        (cita.doctor ? `Dr. ${cita.doctor.nombres} ${cita.doctor.apellidos}` : 'No especificado')}
                                </span>
                            </div>
                            {cita.doctor?.numeroCmp && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">CMP:</span>
                                    <span className="text-sm font-medium">{cita.doctor.numeroCmp}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Especialidad y Precio */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Stethoscope className="w-4 h-4 text-primary" />
                            Servicio Médico
                        </div>
                        <div className="pl-6 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Especialidad:</span>
                                <Badge variant="secondary">{cita.especialidadNombre || cita.especialidad?.nombre || 'No especificado'}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Precio:</span>
                                <span className="text-sm font-semibold text-primary">{formatPrice(cita.precio, cita.moneda)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Fecha y Hora */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Clock className="w-4 h-4 text-primary" />
                            Programación
                        </div>
                        <div className="pl-6 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Fecha:</span>
                                <span className="text-sm font-medium">
                                    {cita.fecha ? format(parseISO(cita.fecha), "EEEE, d 'de' MMMM, yyyy", { locale: es }) : 'No especificado'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Horario:</span>
                                <span className="text-sm font-medium">
                                    {cita.horaInicio && cita.horaFin
                                        ? `${cita.horaInicio} - ${cita.horaFin}`
                                        : cita.hora || 'No especificado'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Motivo de Consulta */}
                    {cita.motivoConsulta && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <FileText className="w-4 h-4 text-primary" />
                                Motivo de Consulta
                            </div>
                            <div className="pl-6">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {cita.motivoConsulta}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Observaciones */}
                    {cita.observaciones && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <MessageSquare className="w-4 h-4 text-primary" />
                                Observaciones
                            </div>
                            <div className="pl-6">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {cita.observaciones}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Fecha de Creación */}
                    {cita.fechaHoraCreacion && (
                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <CalendarClock className="w-3 h-3" />
                                    Registrada el:
                                </div>
                                <span>{formatDateTime(cita.fechaHoraCreacion)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
