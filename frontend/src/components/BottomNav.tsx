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

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0f1115]/95 backdrop-blur-xl border-t border-white/5 pb-safe z-50">
            <div className="flex justify-around items-end pt-0 pb-2">
                {items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="relative flex-1 flex flex-col items-center justify-end py-3 tap-highlight-transparent group"
                        >
                            {/* Top Indicator Line */}
                            {isActive && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute top-0 w-12 h-[2px] bg-blue-500 shadow-[0_2px_8px_rgba(59,130,246,0.5)]"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            <div className="relative p-1 mb-0.5">
                                <item.icon
                                    className={`w-6 h-6 z-10 relative transition-all duration-300 ${isActive ? 'text-blue-400 -translate-y-1' : 'text-slate-500 group-hover:text-slate-400'}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {item.label === 'Settings' && (
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full z-20 border-2 border-[#0f1115]" />
                                )}
                            </div>

                            <span className={`text-[10px] font-medium transition-colors duration-300 ${isActive ? 'text-blue-200' : 'text-slate-600'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="relative flex-1 flex flex-col items-center justify-end py-3 tap-highlight-transparent group"
                >
                    <div className="relative p-1 mb-0.5">
                        <LogOut className="w-6 h-6 text-slate-500 relative z-10 transition-all duration-300 group-hover:text-red-400 group-active:scale-95" strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600">
                        Logout
                    </span>
                </button>
            </div>
        </div>
    );
};
