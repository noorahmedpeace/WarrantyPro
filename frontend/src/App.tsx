import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Navbar } from './components/Navbar';

// Auth pages load eagerly: they are the first thing a signed-out visitor sees,
// and they are small. Everything behind the login is split so signing in does
// not pay for the dashboard, and the dashboard does not pay for settings.
const Signup = lazy(() => import('./pages/Signup').then((m) => ({ default: m.Signup })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then((m) => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then((m) => ({ default: m.ResetPassword })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const AddWarranty = lazy(() => import('./pages/AddWarranty').then((m) => ({ default: m.AddWarranty })));
const WarrantyDetail = lazy(() => import('./pages/WarrantyDetail').then((m) => ({ default: m.WarrantyDetail })));
const ServiceCenters = lazy(() => import('./pages/ServiceCenters').then((m) => ({ default: m.ServiceCenters })));
const CreateClaim = lazy(() => import('./pages/CreateClaim').then((m) => ({ default: m.CreateClaim })));
const FileClaim = lazy(() => import('./pages/FileClaim').then((m) => ({ default: m.FileClaim })));
const ClaimsView = lazy(() => import('./pages/ClaimsView').then((m) => ({ default: m.ClaimsView })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const Notifications = lazy(() => import('./pages/Notifications'));

/** Holds the shape of a page while its chunk arrives, so the layout does not
 *  jump. A centred spinner would move everything twice. */
const RouteFallback = () => (
  <div className="page-shell" aria-busy="true" aria-label="Loading">
    <div className="page-header">
      <div className="h-8 w-56 rounded-control bg-surface-raised" />
      <div className="mt-3 h-4 w-80 rounded-control bg-surface-raised" />
    </div>
    <div className="grid gap-4">
      <div className="h-24 rounded-surface border border-rule bg-surface" />
      <div className="h-24 rounded-surface border border-rule bg-surface" />
      <div className="h-24 rounded-surface border border-rule bg-surface" />
    </div>
  </div>
);

const AppRoutes = () => {
  const location = useLocation();

  return (
    // The page transition used to come from framer-motion, which put the whole
    // animation library in the entry chunk (~100 KB gzipped) so that every
    // signed-out visitor downloaded it to see one fade. A CSS keyframe does the
    // same job for nothing, and framer-motion now loads only with the routes
    // that genuinely animate.
    <div key={location.pathname} className="route-enter">
        <Suspense fallback={<RouteFallback />}>
          <Routes location={location}>
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
        </Suspense>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-[100dvh] overflow-x-hidden bg-paper pb-24 text-ink md:pb-0 md:pl-56">
          <AppRoutes />
          <Navbar />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
