import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useEspecialidades } from '@/hooks/useEspecialidades';
import { useDoctoresPorEspecialidad } from '@/hooks/useDoctores';
import { useHorariosPorDoctorYFecha } from '@/hooks/useHorarios';
import { useCitasPaciente } from '@/hooks/useCitas';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  User,
  CalendarIcon,
  Clock,
  FileText,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Especialidad, Doctor, HorarioDisponible } from '@/types';

type Step = 1 | 2 | 3 | 4 | 5;

const stepTitles: Record<Step, { title: string; description: string }> = {
  1: { title: 'Especialidad', description: 'Selecciona la especialidad médica' },
  2: { title: 'Doctor', description: 'Elige tu médico preferido' },
  3: { title: 'Fecha', description: 'Selecciona el día de tu cita' },
  4: { title: 'Horario', description: 'Elige un horario disponible' },
  5: { title: 'Detalles', description: 'Completa la información de tu cita' },
};

export function ReservarCita() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>(1);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<Especialidad | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedHorario, setSelectedHorario] = useState<HorarioDisponible | null>(null);
  const [motivoConsulta, setMotivoConsulta] = useState('');
  const [notasAdicionales, setNotasAdicionales] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { especialidades, isLoading: loadingEsp } = useEspecialidades();
  const { doctores, isLoading: loadingDoc } = useDoctoresPorEspecialidad(selectedEspecialidad?.id || null);
  const { horarios, isLoading: loadingHor } = useHorariosPorDoctorYFecha(
    selectedDoctor?.id || null,
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
  );
  const { crearCita } = useCitasPaciente(user?.id || null);

  const handleNext = () => {
    if (step < 5) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedEspecialidad;
      case 2: return !!selectedDoctor;
      case 3: return !!selectedDate;
      case 4: return !!selectedHorario;
      case 5: return motivoConsulta.trim().length > 0;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedHorario) return;

    setIsSubmitting(true);
    try {
      await crearCita({
        pacienteId: user.id,
        horarioDisponibleId: selectedHorario.id,
        motivoConsulta,
        notasAdicionales: notasAdicionales || undefined,
      });

      toast({
        title: '¡Cita reservada!',
        description: 'Tu cita ha sido reservada exitosamente',
      });
      
      navigate('/paciente/citas');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo reservar la cita',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabledDays = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reservar Cita</h1>
          <p className="text-muted-foreground mt-1">
            Sigue los pasos para agendar tu cita médica
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {([1, 2, 3, 4, 5] as Step[]).map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
                  step === s
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : step > s
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 5 && (
                <div
                  className={cn(
                    'w-12 md:w-20 h-1 mx-1',
                    step > s ? 'bg-success' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 1 && <Stethoscope className="w-5 h-5 text-primary" />}
              {step === 2 && <User className="w-5 h-5 text-primary" />}
              {step === 3 && <CalendarIcon className="w-5 h-5 text-primary" />}
              {step === 4 && <Clock className="w-5 h-5 text-primary" />}
              {step === 5 && <FileText className="w-5 h-5 text-primary" />}
              {stepTitles[step].title}
            </CardTitle>
            <CardDescription>{stepTitles[step].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Especialidad */}
            {step === 1 && (
              <div className="space-y-4">
                {loadingEsp ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {especialidades.map((esp) => (
                      <button
                        key={esp.id}
                        onClick={() => setSelectedEspecialidad(esp)}
                        className={cn(
                          'p-4 rounded-xl border-2 text-left transition-all hover:shadow-md',
                          selectedEspecialidad?.id === esp.id
                            ? 'border-primary bg-primary-light'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <p className="font-semibold text-foreground">{esp.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          S/ {esp.precioConsulta.toFixed(2)}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Doctor */}
            {step === 2 && (
              <div className="space-y-4">
                {loadingDoc ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : doctores.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay doctores disponibles para esta especialidad
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {doctores.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDoctor(doc)}
                        className={cn(
                          'p-4 rounded-xl border-2 text-left transition-all hover:shadow-md',
                          selectedDoctor?.id === doc.id
                            ? 'border-primary bg-primary-light'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              Dr. {doc.nombres} {doc.apellidos}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              CMP: {doc.numeroCmp}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Fecha */}
            {step === 3 && (
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDays}
                  locale={es}
                  className="rounded-xl border shadow-sm pointer-events-auto"
                />
              </div>
            )}

            {/* Step 4: Horario */}
            {step === 4 && (
              <div className="space-y-4">
                {loadingHor ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : horarios.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay horarios disponibles para esta fecha. Intenta con otro día.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {horarios.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => setSelectedHorario(h)}
                        className={cn(
                          'p-3 rounded-lg border-2 text-center transition-all hover:shadow-md',
                          selectedHorario?.id === h.id
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <Clock className="w-4 h-4 mx-auto mb-1" />
                        <p className="font-semibold">{h.horaInicio}</p>
                        <p className="text-xs opacity-80">{h.horaFin}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Detalles */}
            {step === 5 && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
                  <h4 className="font-semibold text-foreground">Resumen de tu cita</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Especialidad</p>
                      <p className="font-medium">{selectedEspecialidad?.nombre}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Doctor</p>
                      <p className="font-medium">
                        Dr. {selectedDoctor?.nombres} {selectedDoctor?.apellidos}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fecha</p>
                      <p className="font-medium">
                        {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Horario</p>
                      <p className="font-medium">
                        {selectedHorario?.horaInicio} - {selectedHorario?.horaFin}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p className="text-muted-foreground">Precio</p>
                    <p className="text-xl font-bold text-primary">
                      S/ {selectedEspecialidad?.precioConsulta.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="motivo">Motivo de la consulta *</Label>
                    <Textarea
                      id="motivo"
                      placeholder="Describe brevemente el motivo de tu consulta..."
                      value={motivoConsulta}
                      onChange={(e) => setMotivoConsulta(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notas">Notas adicionales (opcional)</Label>
                    <Textarea
                      id="notas"
                      placeholder="Información adicional, alergias, medicamentos actuales, etc."
                      value={notasAdicionales}
                      onChange={(e) => setNotasAdicionales(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>

              {step < 5 ? (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  variant="hero"
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Reservando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirmar Cita
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
