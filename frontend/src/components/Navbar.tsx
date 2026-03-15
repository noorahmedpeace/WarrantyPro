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
                className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-white border-4 border-dark shadow-neu"
            >
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <motion.div
                            key={link.path}
                            whileHover={{ y: -4, x: -4, boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
                            whileTap={{ y: 0, x: 0, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                        >
                            <Link
                                to={link.path}
                                className={clsx(
                                    "relative flex items-center gap-2 px-3 sm:px-4 py-2 border-2 transition-all font-bold uppercase text-xs sm:text-sm",
                                    isActive 
                                        ? "bg-primary text-white border-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
                                        : "bg-white text-dark border-transparent hover:border-dark hover:bg-secondary"
                                )}
                            >
                                <link.icon className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
                                <span className="hidden sm:inline">{link.label}</span>
                            </Link>
                        </motion.div>
                    );
                })}

                <div className="w-1 h-8 bg-dark mx-2"></div>

                {/* Logout Button */}
                <motion.button
                    onClick={handleLogout}
                    whileHover={{ y: -4, x: -4, boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
                    whileTap={{ y: 0, x: 0, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                    className="relative flex items-center gap-2 px-3 sm:px-4 py-2 border-2 border-transparent text-dark font-bold uppercase text-xs sm:text-sm transition-all hover:bg-red-400 hover:text-white hover:border-dark"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" strokeWidth={3} />
                    <span className="hidden sm:inline">Logout</span>
                </motion.button>
            </motion.div>
        </div>
    );
};
