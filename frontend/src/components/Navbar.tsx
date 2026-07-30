import { Link, useLocation } from 'react-router-dom';
import { Building2, ClipboardList, LayoutGrid, Plus, Settings2 } from 'lucide-react';
import { clsx } from 'clsx';
import { ThemeToggle } from './ui/ThemeToggle';
import { WarrantyProMark } from './HeritageIcons';

// Public surfaces carry their own header.
const PUBLIC_ROUTES = ['/', '/security', '/login', '/signup', '/forgot-password', '/reset-password'];

const LINKS = [
    { path: '/coverage', icon: LayoutGrid, label: 'Coverage' },
    { path: '/claims', icon: ClipboardList, label: 'Claims' },
    { path: '/warranties/new', icon: Plus, label: 'Add' },
    { path: '/service-centers', icon: Building2, label: 'Centres' },
    { path: '/configuration', icon: Settings2, label: 'Settings' },
];

/**
 * One navigation for the whole product. The previous version hid itself on "/",
 * which is the dashboard, so the busiest screen in the app had no navigation at
 * all and a second floating bar existed to compensate. It also ran a 4.2s
 * infinite float on the active icon, which was the only reason framer-motion sat
 * in the entry chunk.
 */
export const Navbar = () => {
    const location = useLocation();
    if (PUBLIC_ROUTES.includes(location.pathname)) return null;

    const isCurrent = (path: string) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <nav
            aria-label="Primary"
            className="vt-rail fixed inset-x-0 bottom-0 z-50 border-t border-rule bg-surface/95 backdrop-blur-sm md:inset-x-auto md:left-0 md:top-0 md:h-dvh md:w-56 md:border-r md:border-t-0"
        >
            {/* Desktop: a persistent rail. Mobile: a tab bar. Neither is the other
                one shrunk, so the labels and touch targets suit each. */}
            <div className="mx-auto flex max-w-lg items-stretch gap-1 px-2 py-1.5 md:h-full md:max-w-none md:flex-col md:gap-0.5 md:px-3 md:py-5">
                <div className="hidden md:mb-6 md:flex md:items-center md:gap-2.5 md:px-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-control bg-accent text-on-accent">
                        <WarrantyProMark className="h-4 w-4" />
                    </span>
                    <span className="font-display text-heading tracking-tight text-ink">WarrantyPro</span>
                </div>

                {LINKS.map(({ path, icon: Icon, label }) => {
                    const active = isCurrent(path);
                    return (
                        <Link
                            key={path}
                            to={path}
                            viewTransition
                            aria-current={active ? 'page' : undefined}
                            style={active ? ({ viewTransitionName: 'nav-active' } as React.CSSProperties) : undefined}
                            className={clsx(
                                'flex flex-1 flex-col items-center justify-center gap-1 rounded-control px-2 py-2',
                                'transition-colors duration-feedback active:translate-y-px',
                                'md:min-h-0 md:flex-none md:flex-row md:justify-start md:gap-3 md:px-3 md:py-2.5',
                                active
                                    ? 'bg-accent-wash text-accent'
                                    : 'text-neutral hover:bg-surface-raised hover:text-ink'
                            )}
                        >
                            <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2 : 1.7} />
                            <span
                                className={clsx(
                                    'text-[0.68rem] leading-none md:text-label',
                                    active ? 'font-semibold' : 'font-medium'
                                )}
                            >
                                {label}
                            </span>
                        </Link>
                    );
                })}

                <div className="hidden md:mt-auto md:block md:px-2">
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
};
