import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, LogOut, User } from 'lucide-react';

export function PublicHeader() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.rol) {
      case 'PACIENTE':
        return '/paciente/dashboard';
      case 'DOCTOR':
        return '/doctor/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center group-hover:shadow-glow transition-shadow">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Clínica <span className="text-gradient">Jesus</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Inicio
          </Link>
          <Link to="/#servicios" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Servicios
          </Link>
          <Link to="/#contacto" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Contacto
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to={getDashboardPath()}>
                  <User className="w-4 h-4 mr-1" />
                  {user?.nombres}
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth/login">Iniciar Sesión</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth/registro">Registrarse</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
