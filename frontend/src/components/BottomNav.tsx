import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusSquare, FileText, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const items = [
        { path: '/', icon: Home, label: 'Home' },
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
            {/* Glass Container */}
            <div className="bg-[#0f1115]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl shadow-black/50 overflow-hidden">
                <div className="flex justify-around items-center p-2">
                    {items.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative flex-1 flex flex-col items-center justify-center py-2 tap-highlight-transparent group"
                            >
                                {/* Active Spotlight Background */}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-spotlight"
                                        className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                <div className="relative p-1">
                                    <item.icon
                                        className={`w-5 h-5 z-10 relative transition-all duration-300 ${isActive ? 'text-blue-100' : 'text-slate-400 group-hover:text-slate-300'}`}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    {/* Notification Dot for Settings */}
                                    {item.label === 'Settings' && (
                                        <span className="absolute top-1 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full z-20 border border-[#0f1115]" />
                                    )}
                                </div>

                                <span className={`text-[10px] font-medium transition-all duration-300 mt-0.5 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="relative flex-1 flex flex-col items-center justify-center py-2 tap-highlight-transparent group"
                    >
                        <div className="relative p-1">
                            <LogOut className="w-5 h-5 text-slate-500 relative z-10 transition-all duration-300 group-hover:text-red-400" strokeWidth={2} />
                        </div>
                        <span className="text-[10px] font-medium text-slate-600 mt-0.5 group-hover:text-red-400/80 transition-colors">
                            Logout
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
