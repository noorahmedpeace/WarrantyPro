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
    if (['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname)) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 md:hidden px-4 pb-4">
            {/* Premium frosted glass floating bar */}
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-lg shadow-slate-200/60 flex justify-between items-center px-2 py-1">
                {items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`relative flex-1 flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-200 ${
                                isActive
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <div className="relative">
                                <item.icon
                                    className={`w-5 h-5 z-10 relative transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-slate-400'}`}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                />
                                {/* Notification Badge */}
                                {item.showBadge && <NotificationBadge className="absolute -top-2 -right-2" />}
                            </div>

                            <span className={`text-[9px] font-semibold tracking-tight mt-1 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="relative flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" strokeWidth={1.8} />
                    <span className="text-[9px] font-semibold tracking-tight mt-1">
                        Logout
                    </span>
                </button>
            </div>
        </div>
    );
};
