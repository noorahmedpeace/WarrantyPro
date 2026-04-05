import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, CirclePlus, ClipboardList, Home, Settings2 } from 'lucide-react';
import { clsx } from 'clsx';

export const Navbar = () => {
    const location = useLocation();

    if (['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname) || location.pathname === '/') {
        return null;
    }

    const links = [
        { path: '/', icon: Home, label: 'HOME' },
        { path: '/service-centers', icon: Building2, label: 'CENTERS' },
        { path: '/warranties/new', icon: CirclePlus, label: 'ADD' },
        { path: '/claims', icon: ClipboardList, label: 'CLAIMS' },
        { path: '/configuration', icon: Settings2, label: 'SETTINGS' },
    ];

    return (
        <div className="pointer-events-none fixed bottom-3 left-1/2 z-50 w-full max-w-[98vw] -translate-x-1/2 px-3 sm:bottom-6 sm:max-w-[92vw] sm:px-0">
            <nav className="glass-floating-nav pointer-events-auto mx-auto max-w-[920px] p-[1px]">
                <div className="rounded-[calc(1.75rem-1px)] bg-white/88 px-2 py-2 backdrop-blur-xl">
                    <div className="flex items-stretch gap-1.5 rounded-[1.35rem] bg-[#f8fafc]/88 px-1 py-1 sm:gap-2">
                        {links.map((link) => {
                            const isActive = location.pathname === link.path;
                            const Icon = link.icon;

                            return (
                                <div key={link.path} className="flex-1">
                                    <motion.div whileTap={{ scale: 0.97 }}>
                                    <Link
                                        to={link.path}
                                        className={clsx(
                                            'group micro-lift relative flex w-full flex-col items-center justify-center rounded-[1.15rem] px-2.5 py-3 text-center transition-all duration-200 sm:rounded-[1.25rem] sm:px-3',
                                            isActive
                                                ? 'text-slate-950'
                                                : 'text-slate-500 hover:bg-white hover:text-slate-950'
                                        )}
                                    >
                                        {isActive && (
                                            <span className="absolute inset-1 rounded-[0.95rem] border border-sky-200 bg-sky-50 sm:rounded-[1rem]" />
                                        )}
                                        <div
                                            className={clsx(
                                                'relative rounded-full p-2 transition-colors duration-200',
                                                isActive ? 'text-sky-600' : 'text-slate-500'
                                            )}
                                        >
                                            {isActive ? (
                                                <motion.div
                                                    animate={{ y: [0, -2, 0], scale: [1, 1.06, 1] }}
                                                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                                                >
                                                    <Icon className="h-5 w-5" strokeWidth={2.1} />
                                                </motion.div>
                                            ) : (
                                                <Icon className="h-5 w-5" strokeWidth={1.9} />
                                            )}
                                        </div>
                                        <span className="relative mt-1.5 text-[0.62rem] font-semibold tracking-[0.24em]">
                                            {link.label}
                                        </span>
                                    </Link>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </div>
    );
};
