import { Link, useLocation } from 'react-router-dom';
import { Building2, CirclePlus, ClipboardList, Home, Settings2 } from 'lucide-react';
import { clsx } from 'clsx';

export const Navbar = () => {
    const location = useLocation();

    if (['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname)) {
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
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 w-full max-w-[98vw] -translate-x-1/2 px-3 sm:bottom-6 sm:max-w-[92vw] sm:px-0">
            <nav className="pointer-events-auto mx-auto max-w-[920px] rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,34,0.96),rgba(9,13,20,0.96))] p-[1px] shadow-[0_24px_52px_rgba(0,0,0,0.32)]">
                <div className="rounded-[calc(2rem-1px)] border border-white/6 bg-[linear-gradient(180deg,rgba(36,42,52,0.95),rgba(17,21,28,0.98))] px-2 py-2">
                    <div className="flex items-stretch gap-2 rounded-[1.55rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-1 py-1">
                        {links.map((link) => {
                            const isActive = location.pathname === link.path;
                            const Icon = link.icon;

                            return (
                                <div key={link.path} className="flex-1">
                                    <Link
                                        to={link.path}
                                        className={clsx(
                                            'group relative flex w-full flex-col items-center justify-center rounded-[1.25rem] px-3 py-3 text-center transition-all duration-200',
                                            isActive
                                                ? 'text-white'
                                                : 'text-white/82 hover:bg-white/[0.03] hover:text-white'
                                        )}
                                    >
                                        {isActive && (
                                            <span className="absolute inset-1 rounded-[1rem] border border-[#d7b86f]/20 bg-[radial-gradient(circle_at_top,rgba(224,188,108,0.16),rgba(224,188,108,0.02)_65%)]" />
                                        )}
                                        <div
                                            className={clsx(
                                                'relative rounded-full p-2 transition-colors duration-200',
                                                isActive ? 'text-[#f6ddaa]' : 'text-white'
                                            )}
                                        >
                                            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.1 : 1.9} />
                                        </div>
                                        <span className="relative mt-1.5 text-[0.62rem] font-semibold tracking-[0.24em]">
                                            {link.label}
                                        </span>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </div>
    );
};
