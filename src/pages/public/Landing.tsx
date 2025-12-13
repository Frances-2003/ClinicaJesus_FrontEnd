import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Heart,
  Calendar,
  Shield,
  Clock,
  Users,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const services = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Cardiología',
    description: 'Especialistas en salud cardiovascular con tecnología de punta.',
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Medicina General',
    description: 'Atención integral para toda la familia.',
  },
  {
    icon: <Stethoscope className="w-8 h-8" />,
    title: 'Pediatría',
    description: 'Cuidado especializado para los más pequeños.',
  },
];

const features = [
  'Más de 20 especialidades médicas',
  'Doctores certificados y con experiencia',
  'Tecnología médica de última generación',
  'Atención personalizada y humana',
];

export function Landing() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleReservarCita = () => {
    if (isAuthenticated && user?.rol === 'PACIENTE') {
      navigate('/paciente/reservar');
    } else {
      navigate('/auth/login', { state: { redirectTo: '/paciente/reservar' } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl -z-10" />
        
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-light text-primary text-sm font-medium mb-6 animate-fade-in">
              <Shield className="w-4 h-4" />
              Tu salud es nuestra prioridad
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-slide-up">
              Cuidamos de ti con{' '}
              <span className="text-gradient">excelencia médica</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Reserva tu cita médica en línea de forma rápida y sencilla. 
              Contamos con los mejores especialistas para cuidar de tu salud y la de tu familia.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button size="xl" variant="hero" onClick={handleReservarCita}>
                Reservar Cita
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
              <Button size="xl" variant="outline" asChild>
                <a href="#servicios">Ver Servicios</a>
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Atención 24/7
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Citas en línea
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                +50 Especialistas
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-card shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nuestras Especialidades
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Contamos con un equipo de profesionales altamente capacitados en diversas áreas de la medicina.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-6 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg">
              Ver todas las especialidades
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para cuidar tu salud?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            No esperes más. Agenda tu cita con nuestros especialistas y recibe la atención que mereces.
          </p>
          <Button size="xl" variant="hero-outline" onClick={handleReservarCita}>
            Reservar Cita Ahora
            <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Contáctanos
              </h2>
              <p className="text-lg text-muted-foreground">
                Estamos aquí para ayudarte. No dudes en comunicarte con nosotros.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4 text-primary">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold mb-2">Teléfono</h3>
                  <p className="text-muted-foreground">(01) 234-5678</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4 text-primary">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-muted-foreground">contacto@clinicasalud.com</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4 text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold mb-2">Dirección</h3>
                  <p className="text-muted-foreground">Av. Principal 123, Lima</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Clínica Salud</span>
            </div>
            <p className="text-sm opacity-70">
              © 2025 Clínica Salud. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
