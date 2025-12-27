import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Generar slots de 30 minutos desde 08:00 hasta 20:00
const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 8; hour <= 20; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push(time);
        }
    }
    return slots;
};

const timeSlots = generateTimeSlots();

const formSchema = z.object({
    fecha: z.date({ required_error: 'Selecciona una fecha' }),
    horaInicio: z.string().min(1, 'Selecciona hora de inicio'),
    horaFin: z.string().min(1, 'Selecciona hora de fin'),
}).refine((data) => {
    if (!data.horaInicio || !data.horaFin) return true;
    return data.horaFin > data.horaInicio;
}, {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['horaFin'],
}).refine((data) => {
    if (!data.fecha || !data.horaInicio) return true;
    if (isToday(data.fecha)) {
        const [hours, minutes] = data.horaInicio.split(':').map(Number);
        const now = new Date();
        const selectedDateTime = new Date();
        selectedDateTime.setHours(hours, minutes, 0, 0);
        return selectedDateTime > now;
    }
    return true;
}, {
    message: 'No puedes registrar un horario en el pasado',
    path: ['horaInicio'],
});

interface RegistrarHorarioDialogProps {
    doctorId: number;
    onSuccess: () => void;
}

export function RegistrarHorarioDialog({ doctorId, onSuccess }: RegistrarHorarioDialogProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            horaInicio: '',
            horaFin: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await api.crearHorario({
                doctorId,
                fecha: format(values.fecha, 'yyyy-MM-dd'),
                horaInicio: values.horaInicio,
                horaFin: values.horaFin,
                activo: true,
            });

            toast({
                title: 'Horario registrado',
                description: 'El horario se ha creado exitosamente.',
            });

            onSuccess();
            setOpen(false);
            form.reset();
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Error al registrar horario',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Agregar Horario
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Nuevo Horario</DialogTitle>
                    <DialogDescription>
                        Define tu disponibilidad para atender pacientes
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="fecha"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Fecha</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full pl-3 text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP", { locale: es })
                                                    ) : (
                                                        <span>Selecciona una fecha</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date(new Date().setHours(0, 0, 0, 0))
                                                }
                                                locale={es}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="horaInicio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hora de Inicio</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona hora" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="max-h-[200px]">
                                            {timeSlots.filter(time => {
                                                if (!field.value || !isToday(field.value)) return true;
                                                const [hours, minutes] = time.split(':').map(Number);
                                                const now = new Date();
                                                const slotTime = new Date();
                                                slotTime.setHours(hours, minutes, 0, 0);
                                                return slotTime > now;
                                            }).map((time) => (
                                                <SelectItem key={time} value={time}>
                                                    {time}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="horaFin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hora de Fin</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona hora" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="max-h-[200px]">
                                            {timeSlots.filter(time => {
                                                if (!field.value || !isToday(field.value)) return true;
                                                const [hours, minutes] = time.split(':').map(Number);
                                                const now = new Date();
                                                const slotTime = new Date();
                                                slotTime.setHours(hours, minutes, 0, 0);
                                                return slotTime > now;
                                            }).map((time) => (
                                                <SelectItem key={time} value={time}>
                                                    {time}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Registrar
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
