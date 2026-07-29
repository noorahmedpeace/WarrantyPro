import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * "/" used to be the dashboard. It is now the public home page, so anyone who
 * had the dashboard bookmarked would land on marketing copy after this change.
 * A signed-in session is sent straight through to /coverage instead.
 */
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-[100dvh] bg-paper" aria-busy="true" />;
    }

    if (user) {
        return <Navigate to="/coverage" replace />;
    }

    return <>{children}</>;
};
