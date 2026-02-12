import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CursorGlow } from './components/ui/CursorGlow';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { AddWarranty } from './pages/AddWarranty';
import { WarrantyDetail } from './pages/WarrantyDetail';
import { CreateClaim } from './pages/CreateClaim';
import { ClaimsView } from './pages/ClaimsView';
import { Settings } from './pages/Settings';
import { Navbar } from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen mesh-gradient text-white overflow-x-hidden">
          <CursorGlow />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/warranties/new" element={<ProtectedRoute><AddWarranty /></ProtectedRoute>} />
            <Route path="/warranties/:id" element={<ProtectedRoute><WarrantyDetail /></ProtectedRoute>} />
            <Route path="/warranties/:id/claims/new" element={<ProtectedRoute><CreateClaim /></ProtectedRoute>} />
            <Route path="/claims" element={<ProtectedRoute><ClaimsView /></ProtectedRoute>} />
            <Route path="/configuration" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
          <Navbar />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
