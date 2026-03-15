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
        <div className="fixed bottom-0 left-0 w-full z-50 xl:hidden">
            {/* Blocky Container */}
            <div className="bg-white border-t-4 border-dark overflow-hidden flex justify-between items-center shadow-[0_-4px_0_0_rgba(0,0,0,1)]">
                {items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`relative flex-1 flex flex-col items-center justify-center py-3 tap-highlight-transparent transition-all border-r-4 border-dark last:border-r-0 ${
                                isActive ? 'bg-secondary' : 'bg-white hover:bg-gray-100'
                            }`}
                        >
                            <div className="relative">
                                <item.icon
                                    className={`w-6 h-6 z-10 relative transition-all duration-300 ${isActive ? 'text-dark scale-110' : 'text-gray-500'}`}
                                    strokeWidth={isActive ? 3 : 2}
                                />
                                {/* Notification Badge */}
                                {item.showBadge && <NotificationBadge className="absolute -top-2 -right-2 border-2 border-dark" />}
                            </div>

                            <span className={`text-[10px] font-black uppercase tracking-tight mt-1 ${isActive ? 'text-dark' : 'text-gray-500'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="relative flex flex-col items-center justify-center py-3 px-4 tap-highlight-transparent bg-red-400 hover:bg-red-500 transition-colors border-l-4 border-dark"
                >
                    <LogOut className="w-6 h-6 text-dark relative z-10" strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-tight text-dark mt-1">
                        Logout
                    </span>
                </button>
            </div>
        </div>
    );
};
