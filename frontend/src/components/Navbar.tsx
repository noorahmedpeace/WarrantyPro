import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, Settings, FileText, LogOut, MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-[95vw]">
            <motion.div 
                initial={{ y: 100, x: '-50%', opacity: 0 }}
                animate={{ y: 0, x: '-50%', opacity: 1 }}
                style={{ left: '50%', position: 'fixed' }}
                className="flex items-center gap-2 sm:gap-4 p-2 sm:p-2.5 glass-panel"
            >
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <motion.div
                            key={link.path}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                to={link.path}
                                className={clsx(
                                    "relative flex items-center gap-2 px-3 sm:px-4 py-2 transition-all font-semibold rounded-xl text-xs sm:text-sm",
                                    isActive 
                                        ? "bg-primary text-white shadow-md shadow-primary/30" 
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                                )}
                            >
                                <link.icon className="w-5 h-5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                                <span className="hidden sm:inline">{link.label}</span>
                            </Link>
                        </motion.div>
                    );
                })}

                <div className="w-px h-6 bg-slate-200 mx-1"></div>

                {/* Logout Button */}
                <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex items-center gap-2 px-3 sm:px-4 py-2 text-slate-500 font-semibold rounded-xl text-xs sm:text-sm transition-all hover:bg-red-50 hover:text-red-600"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" strokeWidth={2} />
                    <span className="hidden sm:inline">Logout</span>
                </motion.button>
            </motion.div>
        </div>
    );
};
