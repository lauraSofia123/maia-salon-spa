import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Header from './components/Header';
import Footer from './components/Footer';

// Public pages
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Gallery from './pages/Gallery';
import Professionals from './pages/Professionals';
import ProfessionalDetail from './pages/ProfessionalDetail';
import Branches from './pages/Branches';
import BranchDetail from './pages/BranchDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Booking flow
import BookingFlow from './pages/booking/BookingFlow';

// Client area
import ClientLayout from './pages/client/ClientLayout';
import ClientDashboard from './pages/client/Dashboard';
import ClientAppointments from './pages/client/Appointments';
import ClientAppointmentDetail from './pages/client/AppointmentDetail';
import ClientProfile from './pages/client/Profile';
import ClientLoyalty from './pages/client/Loyalty';
import ClientPayments from './pages/client/Payments';

// Professional area
import ProfessionalLayout from './pages/professional/ProfessionalLayout';
import ProfessionalDashboard from './pages/professional/Dashboard';
import ProfessionalSchedule from './pages/professional/Schedule';
import ProfessionalAppointments from './pages/professional/Appointments';

// Admin area
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminServices from './pages/admin/Services';
import AdminBranches from './pages/admin/Branches';
import AdminProfessionals from './pages/admin/Professionals';
import AdminAppointments from './pages/admin/Appointments';
import AdminPayments from './pages/admin/Payments';
import AdminPromotions from './pages/admin/Promotions';
import AdminLoyalty from './pages/admin/Loyalty';
import AdminGallery from './pages/admin/Gallery';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/servicios/:id" element={<ServiceDetail />} />
          <Route path="/galeria" element={<Gallery />} />
          <Route path="/profesionales" element={<Professionals />} />
          <Route path="/profesionales/:id" element={<ProfessionalDetail />} />
          <Route path="/sedes" element={<Branches />} />
          <Route path="/sedes/:id" element={<BranchDetail />} />
          
          {/* Auth routes */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Booking flow - requires auth */}
          <Route 
            path="/reservar/*" 
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <BookingFlow />
              </ProtectedRoute>
            } 
          />
          
          {/* Client area */}
          <Route 
            path="/mi-cuenta/*" 
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientLayout />
              </ProtectedRoute>
            } 
          />
          
          {/* Professional area */}
          <Route 
            path="/profesional/*" 
            element={
              <ProtectedRoute allowedRoles={['professional']}>
                <ProfessionalLayout />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin area */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;