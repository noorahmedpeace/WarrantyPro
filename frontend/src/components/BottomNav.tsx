import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusSquare, FileText, Settings, LogOut, Bell, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationBadge from './NotificationBadge';

export const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const items: { path: string; icon: any; label: string; showBadge?: boolean }[] = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/service-centers', icon: MapPin, label: 'Centers' },
        { path: '/warranties/new', icon: PlusSquare, label: 'Add New' },
        { path: '/claims', icon: FileText, label: 'Claims' },
        { path: '/configuration', icon: Settings, label: 'Settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Hide navigation on auth pages
    if (location.pathname === '/login' || location.pathname === '/signup') {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 xl:hidden">
            <div className="bg-white/90 backdrop-blur-lg border-t border-slate-200 flex justify-between items-center shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] px-2 pb-safe">
                {items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="relative flex-1 flex flex-col items-center justify-center py-3 tap-highlight-transparent transition-all group"
                        >
                            <div className="relative">
                                <item.icon
                                    className={`w-6 h-6 z-10 relative transition-all duration-300 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {/* Notification Badge */}
                                {item.showBadge && <NotificationBadge className="absolute -top-1 -right-1" />}
                            </div>

                            <span className={`text-[10px] font-semibold tracking-wide mt-1 transition-colors ${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="relative flex-1 flex flex-col items-center justify-center py-3 tap-highlight-transparent group"
                >
                    <LogOut className="w-6 h-6 text-slate-400 group-hover:text-red-500 transition-colors relative z-10" strokeWidth={2} />
                    <span className="text-[10px] font-semibold tracking-wide text-slate-500 group-hover:text-red-600 mt-1 transition-colors">
                        Logout
                    </span>
                </button>
            </div>
        </div>
    );
};
