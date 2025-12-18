import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Loader2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import type { Especialidad } from '@/types';

const formSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    precioConsulta: z.string().min(1, 'El precio es requerido'),
    activo: z.boolean().default(true),
});

interface EspecialidadDialogProps {
    especialidad?: Especialidad;
    onSuccess: () => void;
    trigger?: 'button' | 'edit';
}

export function EspecialidadDialog({
    especialidad,
    onSuccess,
    trigger = 'button'
}: EspecialidadDialogProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const isEditing = !!especialidad;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: '',
            precioConsulta: '',
            activo: true,
        },
    });

    useEffect(() => {
        if (especialidad && open) {
            form.reset({
                nombre: especialidad.nombre,
                precioConsulta: String(especialidad.precioConsulta),
                activo: especialidad.activo ?? true,
            });
        } else if (!open) {
            form.reset({
                nombre: '',
                precioConsulta: '',
                activo: true,
            });
        }
    }, [especialidad, open, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const data = {
                nombre: values.nombre,
                precioConsulta: parseFloat(values.precioConsulta),
                activo: values.activo,
            };

            if (isEditing) {
                await api.actualizarEspecialidad(especialidad.id, data);
                toast({
                    title: 'Especialidad actualizada',
                    description: 'Los cambios se han guardado correctamente.',
                });
            } else {
                await api.crearEspecialidad(data);
                toast({
                    title: 'Especialidad creada',
                    description: 'La especialidad se ha registrado exitosamente.',
                });
            }

            onSuccess();
            setOpen(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Error al procesar la solicitud',
                variant: 'destructive',
            });
        }
    };

    const TriggerButton = trigger === 'button' ? (
        <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva Especialidad
        </Button>
    ) : (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit className="w-4 h-4" />
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {TriggerButton}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar Especialidad' : 'Nueva Especialidad'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Modifica los datos de la especialidad médica.'
                            : 'Registra una nueva especialidad médica en el sistema.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nombre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la Especialidad</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Cardiología" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="precioConsulta"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Precio de Consulta (S/)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="150.00"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="activo"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>Estado</FormLabel>
                                        <div className="text-sm text-muted-foreground">
                                            {field.value ? 'Activa' : 'Inactiva'}
                                        </div>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
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
                                {isEditing ? 'Guardar Cambios' : 'Crear Especialidad'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
