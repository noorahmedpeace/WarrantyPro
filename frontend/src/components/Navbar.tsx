import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, Settings, FileText, LogOut, MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Hide navbar on auth pages
    if (location.pathname === '/login' || location.pathname === '/signup') {
        return null;
    }

    const links = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/service-centers', icon: MapPin, label: 'Centers' },
        { path: '/warranties/new', icon: Plus, label: 'Add' },
        { path: '/claims', icon: FileText, label: 'Claims' },
        { path: '/configuration', icon: Settings, label: 'Settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="hidden xl:block fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 p-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-floating transition-all">
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={clsx(
                                "relative flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-semibold text-sm",
                                isActive 
                                    ? "bg-primary text-white shadow-soft" 
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                        >
                            <link.icon className="w-5 h-5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}

                <div className="w-px h-8 bg-slate-200 mx-2"></div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-red-600 font-semibold text-sm transition-all hover:bg-red-50 hover:text-red-700"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" strokeWidth={2} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};
