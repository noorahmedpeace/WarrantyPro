import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Camera, Cloud, LogOut, Search, Settings2, UsersRound } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    if (['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname)) {
        return null;
    }

    const links = [
        { path: '/', icon: Search, label: 'Search' },
        { path: '/service-centers', icon: UsersRound, label: 'Family' },
        { path: '/warranties/new', icon: Camera, label: 'Scan' },
        { path: '/claims', icon: Cloud, label: 'Vault' },
        { path: '/configuration', icon: Settings2, label: 'Settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 w-full max-w-[98vw] -translate-x-1/2 px-3 sm:bottom-6 sm:max-w-[92vw] sm:px-0">
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="pointer-events-auto rounded-[2rem] border border-[#8e6732]/80 bg-[linear-gradient(145deg,#5d3515_0%,#311b0d_44%,#1a1008_100%)] p-[1px] shadow-[0_25px_55px_rgba(10,4,2,0.45)]"
            >
                <div className="rounded-[calc(2rem-1px)] border border-[#bb9453]/45 bg-[linear-gradient(180deg,rgba(94,57,24,0.96),rgba(43,24,13,0.98))] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <div className="flex items-center gap-2 rounded-[1.6rem] border border-[#c7a35d]/40 bg-[linear-gradient(180deg,rgba(28,16,9,0.3),rgba(9,5,3,0.18))] px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                        {links.map((link) => {
                            const isActive = location.pathname === link.path;

                            return (
                                <motion.div key={link.path} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="flex-1">
                                    <Link
                                        to={link.path}
                                        className={clsx(
                                            'group flex w-full flex-col items-center justify-center rounded-[1.3rem] border px-3 py-3 text-center transition-all sm:px-4',
                                            isActive
                                                ? 'border-[#d8b56d] bg-[linear-gradient(180deg,#fff0c7_0%,#d8a64b_100%)] text-[#5c3c11] shadow-[0_14px_22px_rgba(84,52,8,0.22)]'
                                                : 'border-[#b58d4d]/25 bg-[linear-gradient(180deg,rgba(255,248,226,0.08),rgba(255,228,177,0.02))] text-[#e8d8b3] hover:border-[#cfaa68]/50 hover:text-[#fff0cb]'
                                        )}
                                    >
                                        <div
                                            className={clsx(
                                                'rounded-full border p-2 transition-all',
                                                isActive
                                                    ? 'border-[#bd9550] bg-[#fff6dd] text-[#5d3c12]'
                                                    : 'border-[#b78d4e]/35 bg-[#29180d]/60 text-[#daba7c] group-hover:border-[#cca761]/60'
                                            )}
                                        >
                                            <link.icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
                                        </div>
                                        <span
                                            className="mt-2 text-[0.56rem] font-semibold uppercase tracking-[0.34em] sm:text-[0.62rem]"
                                            style={{ fontFamily: '"Cinzel", serif' }}
                                        >
                                            {link.label}
                                        </span>
                                    </Link>
                                </motion.div>
                            );
                        })}

                        <motion.button
                            onClick={handleLogout}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex flex-none flex-col items-center justify-center rounded-[1.3rem] border border-[#b88e4e]/35 bg-[linear-gradient(180deg,rgba(255,248,226,0.08),rgba(255,228,177,0.02))] px-3 py-3 text-[#f1d3b3] transition-all hover:border-[#d39a67]/60 hover:text-[#ffd8bf] sm:px-4"
                            title="Logout"
                        >
                            <div className="rounded-full border border-[#bb8e55]/35 bg-[#29180d]/60 p-2 text-[#d59577]">
                                <LogOut className="h-4 w-4" strokeWidth={1.8} />
                            </div>
                            <span
                                className="mt-2 text-[0.56rem] font-semibold uppercase tracking-[0.34em] sm:text-[0.62rem]"
                                style={{ fontFamily: '"Cinzel", serif' }}
                            >
                                Exit
                            </span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
