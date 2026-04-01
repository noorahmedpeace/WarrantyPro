import { Link, useLocation } from 'react-router-dom';
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
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 w-full max-w-[98vw] -translate-x-1/2 px-3 sm:bottom-6 sm:max-w-[92vw] sm:px-0">
            <nav className="pointer-events-auto mx-auto max-w-[920px] rounded-[2rem] border border-slate-200 bg-white p-[1px] shadow-[0_18px_40px_rgba(15,23,42,0.10)]">
                <div className="rounded-[calc(2rem-1px)] bg-white px-2 py-2">
                    <div className="flex items-stretch gap-2 rounded-[1.55rem] bg-[#f8fafc] px-1 py-1">
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
                                                ? 'text-slate-950'
                                                : 'text-slate-500 hover:bg-white hover:text-slate-950'
                                        )}
                                    >
                                        {isActive && (
                                            <span className="absolute inset-1 rounded-[1rem] border border-sky-200 bg-sky-50" />
                                        )}
                                        <div
                                            className={clsx(
                                                'relative rounded-full p-2 transition-colors duration-200',
                                                isActive ? 'text-sky-600' : 'text-slate-500'
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
