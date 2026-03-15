import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, Settings, FileText, LogOut, MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Hide navbar on auth pages
    if (['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname)) {
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
            <div className="flex items-center gap-4 p-3 bg-white border-4 border-dark shadow-neu transition-transform">
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={clsx(
                                "relative flex items-center gap-2 px-4 py-2 border-2 transition-all font-bold uppercase text-sm",
                                isActive 
                                    ? "bg-primary text-white border-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" 
                                    : "bg-white text-dark border-transparent hover:border-dark hover:bg-secondary hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                            )}
                        >
                            <link.icon className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}

                <div className="w-1 h-8 bg-dark mx-2"></div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="relative flex items-center gap-2 px-4 py-2 border-2 border-transparent text-dark font-bold uppercase text-sm transition-all hover:bg-red-400 hover:text-white hover:border-dark hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" strokeWidth={2.5} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};
