import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";

// Public pages
import { Landing } from "@/pages/public/Landing";
import { Login } from "@/pages/auth/Login";
import { Registro } from "@/pages/auth/Registro";

// Patient pages
import { PacienteDashboard } from "@/pages/paciente/PacienteDashboard";
import { MisCitas } from "@/pages/paciente/MisCitas";
import { ReservarCita } from "@/pages/paciente/ReservarCita";

// Doctor pages
import { DoctorDashboard } from "@/pages/doctor/DoctorDashboard";

// Admin pages
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { Doctores } from "@/pages/admin/Doctores";
import { Pacientes } from "@/pages/admin/Pacientes";
import { Reportes } from "@/pages/admin/Reportes";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/registro" element={<Registro />} />

            {/* Patient routes */}
            <Route
              path="/paciente/dashboard"
              element={
                <ProtectedRoute allowedRoles={['PACIENTE']}>
                  <PacienteDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/paciente/citas"
              element={
                <ProtectedRoute allowedRoles={['PACIENTE']}>
                  <MisCitas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/paciente/reservar"
              element={
                <ProtectedRoute allowedRoles={['PACIENTE']}>
                  <ReservarCita />
                </ProtectedRoute>
              }
            />

            {/* Doctor routes */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/citas"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/doctores"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Doctores />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pacientes"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Pacientes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reportes"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Reportes />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
