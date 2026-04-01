import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CursorGlow } from './components/ui/CursorGlow';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { AddWarranty } from './pages/AddWarranty';
import { WarrantyDetail } from './pages/WarrantyDetail';
import { ServiceCenters } from './pages/ServiceCenters';
import { CreateClaim } from './pages/CreateClaim';
import { FileClaim } from './pages/FileClaim';
import { ClaimsView } from './pages/ClaimsView';
import { Settings } from './pages/Settings';
import Notifications from './pages/Notifications';
import { Navbar } from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen overflow-x-hidden pb-24 text-slate-900 bg-white">
          <CursorGlow />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/warranties/new" element={<ProtectedRoute><AddWarranty /></ProtectedRoute>} />
            <Route path="/warranties/:id" element={<ProtectedRoute><WarrantyDetail /></ProtectedRoute>} />
            <Route path="/warranties/:id/claims/new" element={<ProtectedRoute><CreateClaim /></ProtectedRoute>} />
            <Route path="/warranties/:id/file-claim" element={<ProtectedRoute><FileClaim /></ProtectedRoute>} />
            <Route path="/claims" element={<ProtectedRoute><ClaimsView /></ProtectedRoute>} />
            <Route path="/claims/new" element={<ProtectedRoute><CreateClaim /></ProtectedRoute>} />
            <Route path="/service-centers" element={<ProtectedRoute><ServiceCenters /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/configuration" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
          <Navbar />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
