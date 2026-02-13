import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, Settings, FileText, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Hide navbar on auth pages
    if (location.pathname === '/login' || location.pathname === '/signup') {
        return null;
    }

    const links = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/warranties/new', icon: Plus, label: 'Add' },
        { path: '/claims', icon: FileText, label: 'Claims' },
        { path: '/configuration', icon: Settings, label: 'Settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl">
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={clsx(
                                "relative p-3 rounded-xl transition-all duration-300 group",
                                isActive ? "text-white" : "text-slate-400 hover:text-white"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="navbar-indicator"
                                    className="absolute inset-0 bg-white/10 rounded-xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <link.icon className={clsx("w-6 h-6 relative z-10", isActive && "drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]")} />

                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
                                {link.label}
                            </span>
                        </Link>
                    );
                })}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="relative p-3 rounded-xl transition-all duration-300 group text-slate-400 hover:text-red-400"
                    title="Logout"
                >
                    <LogOut className="w-6 h-6 relative z-10" />
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
                        Logout
                    </span>
                </button>
            </div>
        </div>
    );
};
