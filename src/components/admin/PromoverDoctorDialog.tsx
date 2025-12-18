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
import { Loader2 } from 'lucide-react';
import { useEspecialidades } from '@/hooks/useEspecialidades';

const formSchema = z.object({
    numeroCmp: z.string().min(4, 'CMP inválido'),
    especialidadId: z.string().min(1, 'Selecciona una especialidad'),
});

interface PromoverDoctorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (data: { especialidadId: number; numeroCmp: string }) => Promise<void>;
    nombreUsuario: string;
}

export function PromoverDoctorDialog({
    open,
    onOpenChange,
    onConfirm,
    nombreUsuario
}: PromoverDoctorDialogProps) {
    const { especialidades } = useEspecialidades(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            numeroCmp: '',
            especialidadId: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            await onConfirm({
                especialidadId: parseInt(values.especialidadId),
                numeroCmp: values.numeroCmp,
            });
            form.reset();
            onOpenChange(false);
        } catch (error) {
            // Error handling is delegated to parent
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Completar Perfil Médico</DialogTitle>
                    <DialogDescription>
                        Para promover a <b>{nombreUsuario}</b> a Doctor, es necesario ingresar sus datos profesionales.
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
                                        <Input placeholder="12345" {...field} />
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Confirmar Ascenso
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
