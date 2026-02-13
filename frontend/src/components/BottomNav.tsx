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
        <div className="fixed bottom-0 left-0 right-0 bg-[#0f1115]/80 backdrop-blur-xl border-t border-white/5 pb-safe z-50 md:hidden">
            <div className="flex justify-around items-center px-2 py-3">
                {items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link key={item.path} to={item.path} className="relative p-2 flex flex-col items-center gap-1 min-w-[64px]">
                            {isActive && (
                                <motion.div
                                    layoutId="nav-glow"
                                    className="absolute inset-0 bg-blue-500/10 rounded-xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <item.icon className={`w-6 h-6 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                            <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-blue-200' : 'text-slate-600'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
