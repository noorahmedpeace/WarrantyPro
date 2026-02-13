import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, Lock, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export const BottomNav = () => {
    const location = useLocation();

    const items = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/warranties/new', icon: PlusSquare, label: 'Add New' },
        { path: '/vault', icon: Lock, label: 'Cloud Vault' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0f1115]/80 backdrop-blur-2xl border-t border-white/10 pb-safe z-50 md:hidden">
            <div className="flex justify-around items-center px-4 py-2">
                {items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="relative flex-1 flex flex-col items-center justify-center py-2 tap-highlight-transparent"
                        >
                            <div className="relative p-1.5">
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-blue-500/20 rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <item.icon className={`w-6 h-6 z-10 relative transition-all duration-300 ${isActive ? 'text-blue-400 scale-110' : 'text-slate-500'}`} />
                            </div>

                            <span className={`text-[10px] font-medium mt-1 transition-colors duration-300 ${isActive ? 'text-blue-200' : 'text-slate-600'}`}>
                                {item.label}
                            </span>

                            {isActive && (
                                <motion.div
                                    layoutId="nav-dot"
                                    className="absolute bottom-0 w-1 h-1 bg-blue-400 rounded-full mb-1"
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
