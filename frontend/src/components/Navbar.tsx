import { Link, useLocation } from 'react-router-dom';
import { Building2, CirclePlus, ClipboardList, Home, MapPin, Settings2 } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export const Navbar = () => {
    const location = useLocation();

    if (['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname)) {
        return null;
    }

    const links = [
        { path: '/', icon: Home, label: 'HOME' },
        { path: '/service-centers', icon: MapPin, label: 'CENTERS' },
        { path: '/warranties/new', icon: CirclePlus, label: 'ADD' },
        { path: '/claims', icon: ClipboardList, label: 'CLAIMS' },
        { path: '/configuration', icon: Settings2, label: 'SETTINGS' },
    ];

    return (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 w-full max-w-[98vw] -translate-x-1/2 px-3 sm:bottom-6 sm:max-w-[92vw] sm:px-0">
            <motion.nav
                initial={{ y: 70, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="pointer-events-auto mx-auto max-w-[920px] rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,34,0.96),rgba(9,13,20,0.96))] p-[1px] shadow-[0_28px_65px_rgba(0,0,0,0.38)]"
            >
                <div className="rounded-[calc(2.2rem-1px)] border border-white/6 bg-[linear-gradient(180deg,rgba(36,42,52,0.95),rgba(17,21,28,0.98))] px-2 py-2.5">
                    <div className="flex items-stretch gap-2 rounded-[1.65rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-1 py-1.5">
                        {links.map((link) => {
                            const isActive = location.pathname === link.path;
                            const Icon = link.label === 'CENTERS' ? Building2 : link.icon;

                            return (
                                <motion.div key={link.path} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                    <Link
                                        to={link.path}
                                        className={clsx(
                                            'group relative flex w-full flex-col items-center justify-center rounded-[1.35rem] px-3 py-3 text-center transition-all',
                                            isActive ? 'text-white' : 'text-white/86 hover:text-white'
                                        )}
                                    >
                                        {isActive && (
                                            <span className="absolute inset-1 rounded-[1.1rem] border border-[#d7b86f]/25 bg-[radial-gradient(circle_at_top,rgba(224,188,108,0.18),rgba(224,188,108,0.02)_65%)] animate-pulse" />
                                        )}
                                        <div className={clsx(
                                            'relative rounded-full p-2 transition-all',
                                            isActive ? 'text-[#f6ddaa] shadow-[0_0_20px_rgba(216,184,111,0.28)]' : 'text-white'
                                        )}>
                                            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.15 : 1.9} />
                                        </div>
                                        <span className="relative mt-1.5 text-[0.62rem] font-semibold tracking-[0.24em]">
                                            {link.label}
                                        </span>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </motion.nav>
        </div>
    );
};
