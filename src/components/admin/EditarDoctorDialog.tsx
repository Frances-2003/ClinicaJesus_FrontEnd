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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { useEspecialidades } from '@/hooks/useEspecialidades';
import type { Doctor } from '@/types';

const formSchema = z.object({
    numeroCmp: z.string().min(4, 'CMP inválido'),
    especialidadId: z.string().min(1, 'Selecciona una especialidad'),
});

interface EditarDoctorDialogProps {
    doctor: Doctor;
    onSuccess: () => void;
}

export function EditarDoctorDialog({ doctor, onSuccess }: EditarDoctorDialogProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const { especialidades } = useEspecialidades(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            numeroCmp: '',
            especialidadId: '',
        },
    });

    useEffect(() => {
        if (doctor && open) {
            form.reset({
                numeroCmp: doctor.numeroCmp,
                especialidadId: String(doctor.especialidadId),
            });
        }
    }, [doctor, open, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await api.actualizarDoctor(doctor.id, {
                numeroCmp: values.numeroCmp,
                especialidadId: parseInt(values.especialidadId),
            });

            toast({
                title: 'Doctor actualizado',
                description: 'Los datos profesionales se han actualizado correctamente.',
            });

            onSuccess();
            setOpen(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Error al actualizar doctor',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Datos Profesionales</DialogTitle>
                    <DialogDescription>
                        Modifica los datos médicos de <b>Dr. {doctor.nombres} {doctor.apellidos}</b>
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="numeroCmp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número CMP</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123456" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="especialidadId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Especialidad</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione especialidad" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {especialidades.map((esp) => (
                                                <SelectItem key={esp.id} value={esp.id.toString()}>
                                                    {esp.nombre}
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
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
