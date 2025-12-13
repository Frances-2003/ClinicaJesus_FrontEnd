import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Heart,
  LogOut,
  Home,
  Calendar,
  CalendarPlus,
  Users,
  UserCog,
  BarChart3,
  Stethoscope,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const navItemsByRole: Record<string, NavItem[]> = {
  PACIENTE: [
    { label: 'Dashboard', path: '/paciente/dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Mis Citas', path: '/paciente/citas', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Reservar Cita', path: '/paciente/reservar', icon: <CalendarPlus className="w-5 h-5" /> },
  ],
  DOCTOR: [
    { label: 'Dashboard', path: '/doctor/dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Mis Citas', path: '/doctor/citas', icon: <Calendar className="w-5 h-5" /> },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Doctores', path: '/admin/doctores', icon: <Stethoscope className="w-5 h-5" /> },
    { label: 'Pacientes', path: '/admin/pacientes', icon: <Users className="w-5 h-5" /> },
    { label: 'Reportes', path: '/admin/reportes', icon: <BarChart3 className="w-5 h-5" /> },
  ],
};

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = user ? navItemsByRole[user.rol] || [] : [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleLabel = () => {
    switch (user?.rol) {
      case 'PACIENTE':
        return 'Paciente';
      case 'DOCTOR':
        return 'Doctor';
      case 'ADMIN':
        return 'Administrador';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-40">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sidebar-foreground">
              Clínica Salud
            </span>
          </Link>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <UserCog className="w-5 h-5 text-sidebar-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {user?.nombres} {user?.apellidos}
              </p>
              <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        <div className="min-h-screen p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
