import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useUsuarios } from '@/hooks/useUsuarios';
import { AgregarUsuarioDialog } from '@/components/admin/AgregarUsuarioDialog';
import { PromoverDoctorDialog } from '@/components/admin/PromoverDoctorDialog';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Users,
    Search,
    Mail,
    Phone,
    UserCheck,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import type { Usuario, UserRole } from '@/types';
import { EditarUsuarioDialog } from '@/components/admin/EditarUsuarioDialog';


export function Usuarios() {
    const queryClient = useQueryClient();
    const { usuarios, isLoading, refetch } = useUsuarios();
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    // Estado para el modal de promoción
    const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
    const [userToPromote, setUserToPromote] = useState<Usuario | null>(null);

    const filteredUsuarios = usuarios.filter(usuario => {
        const term = searchTerm.toLowerCase();
        return (
            usuario.nombres.toLowerCase().includes(term) ||
            usuario.apellidos.toLowerCase().includes(term) ||
            usuario.email.toLowerCase().includes(term) ||
            usuario.username.toLowerCase().includes(term)
        );
    });

    const handleRoleChange = async (usuario: Usuario, newRole: UserRole) => {
        // Si el nuevo rol es DOCTOR y el usuario no lo era, interceptar para pedir datos
        if (newRole === 'DOCTOR' && usuario.rol !== 'DOCTOR') {
            setUserToPromote(usuario);
            setIsPromoteDialogOpen(true);
            return;
        }

        // Cambio directo (Admin <-> Paciente, Doctor -> Paciente/Admin)
        try {
            await api.actualizarRol(usuario.id, newRole);
            toast({
                title: 'Rol actualizado',
                description: `El usuario ${usuario.username} ahora es ${newRole}`,
            });
            refetch();

            // Invalidar caché de doctores si el cambio afecta a doctores
            if (usuario.rol === 'DOCTOR' || newRole === 'DOCTOR') {
                queryClient.invalidateQueries({ queryKey: ['doctores'] });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Error al cambiar rol',
                variant: 'destructive',
            });
        }
    };

    const handlePromoteConfirm = async (data: { especialidadId: number; numeroCmp: string }) => {
        if (!userToPromote) return;

        try {
            // 1. Cambiar rol
            await api.actualizarRol(userToPromote.id, 'DOCTOR');

            // 2. Crear perfil médico
            await api.crearDoctor({
                usuarioId: userToPromote.id,
                especialidadId: data.especialidadId,
                numeroCmp: data.numeroCmp
            });

            toast({
                title: 'Usuario promovido',
                description: `${userToPromote.nombres} ahora es Doctor colegiado.`,
            });
            refetch();
        } catch (error) {
            toast({
                title: 'Error en promoción',
                description: error instanceof Error ? error.message : 'No se pudo completar la operación',
                variant: 'destructive',
            });
            throw error; // Re-throw para que el modal maneje el estado de carga
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
                        <p className="text-muted-foreground mt-1">
                            Directorio unificado de Pacientes, Doctores y Administradores
                        </p>
                    </div>
                    <AgregarUsuarioDialog onUsuarioCreated={refetch} />
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Directorio ({usuarios.length})
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
                        ) : filteredUsuarios.length === 0 ? (
                            <EmptyState
                                icon={<Users className="w-8 h-8" />}
                                title="No se encontraron usuarios"
                                description={searchTerm ? "Intenta con otros términos de búsqueda" : "No hay usuarios registrados"}
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Usuario</TableHead>
                                            <TableHead>Contacto</TableHead>
                                            <TableHead>Rol Actual</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsuarios.map((usuario) => (
                                            <TableRow key={usuario.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                                            <span className="font-bold text-primary">
                                                                {usuario.nombres[0]}{usuario.apellidos[0]}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-foreground">
                                                                {usuario.nombres} {usuario.apellidos}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">@{usuario.username}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Mail className="w-3 h-3" />
                                                            {usuario.email}
                                                        </div>
                                                        {usuario.telefono && (
                                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                                <Phone className="w-3 h-3" />
                                                                {usuario.telefono}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        usuario.rol === 'ADMIN' ? 'destructive' :
                                                            usuario.rol === 'DOCTOR' ? 'default' : 'secondary'
                                                    }>
                                                        {usuario.rol}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <EditarUsuarioDialog usuario={usuario} onSuccess={refetch} />
                                                        <Select
                                                            value={usuario.rol}
                                                            onValueChange={(val) => handleRoleChange(usuario, val as UserRole)}
                                                        >
                                                            <SelectTrigger className="w-[130px] h-8">
                                                                <div className="flex items-center gap-2">
                                                                    <UserCheck className="w-3 h-3" />
                                                                    <SelectValue />
                                                                </div>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {usuario.rol != 'DOCTOR' && <SelectItem value="PACIENTE">Paciente</SelectItem>}
                                                                <SelectItem value="DOCTOR">Doctor</SelectItem>
                                                                {usuario.rol != 'DOCTOR' && <SelectItem value="ADMIN">Admin</SelectItem>}
                                                            </SelectContent>
                                                        </Select>
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

                {userToPromote && (
                    <PromoverDoctorDialog
                        open={isPromoteDialogOpen}
                        onOpenChange={setIsPromoteDialogOpen}
                        onConfirm={handlePromoteConfirm}
                        nombreUsuario={`${userToPromote.nombres} ${userToPromote.apellidos}`}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
