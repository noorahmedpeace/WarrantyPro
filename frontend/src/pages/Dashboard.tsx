import { useEffect, useMemo, useState } from 'react';
import { FileScan, LockKeyhole, LogOut, Sparkles, BellRing } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { WarrantyProMark } from '../components/HeritageIcons';
import { ScrollScrubVideo } from '../components/ScrollScrubVideo';
import warrantyVaultVideo from '../assets/warranty-vault-exploded.mp4';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const featureItems = [
    {
        icon: FileScan,
        title: 'Auto-OCR Scanning',
        detail: 'Instant data entry',
    },
    {
        icon: BellRing,
        title: 'Smart Reminders',
        detail: 'Never miss an expiry',
    },
    {
        icon: LockKeyhole,
        title: 'Cloud Secured',
        detail: 'Your data, always safe',
    },
];

export const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        let ticking = false;

        const updateProgress = () => {
            const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
            setScrollProgress(clamp(progress, 0, 1));
            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateProgress);
                ticking = true;
            }
        };

        updateProgress();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    const initial = (user?.name || user?.email || 'W').trim().charAt(0).toUpperCase();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const copyStyle = useMemo(() => {
        const eased = clamp(scrollProgress * 1.15, 0, 1);
        return {
            opacity: 0.34 + eased * 0.66,
            transform: `translate3d(${(1 - eased) * 44}px, ${(1 - eased) * 18}px, 0)`,
        };
    }, [scrollProgress]);

    const bubbleStyle = (delay: number) => {
        const eased = clamp((scrollProgress - delay) * 2.2, 0, 1);
        return {
            opacity: 0.25 + eased * 0.75,
            transform: `translate3d(${(1 - eased) * 36}px, ${(1 - eased) * 10}px, 0)`,
        };
    };

    return (
        <div className="relative min-h-[420vh] overflow-x-hidden bg-[linear-gradient(180deg,#020304_0%,#06080d_22%,#0a0d12_52%,#030406_100%)] text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 h-[54vh] bg-[radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.06),rgba(255,255,255,0)_38%),radial-gradient(circle_at_82%_18%,rgba(181,138,58,0.1),rgba(181,138,58,0)_32%)]" />
                <div className="absolute left-[6%] top-[26%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(34,42,59,0.62),rgba(34,42,59,0))]" />
                <div className="absolute right-[10%] top-[18%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(107,84,40,0.18),rgba(107,84,40,0))]" />
            </div>

            <div className="sticky top-0 min-h-screen overflow-hidden">
                <header className="absolute inset-x-0 top-0 z-20 px-4 py-4 sm:px-8 sm:py-6">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(13,16,22,0.82),rgba(9,11,15,0.68))] px-4 py-3 backdrop-blur-xl sm:px-5">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="rounded-2xl border border-[#d9bb79]/25 bg-white/5 p-2.5">
                                <WarrantyProMark className="h-9 w-9" />
                            </div>
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold uppercase tracking-[0.26em] text-white">Warranty Pro</div>
                                <div className="truncate text-xs text-[#b7bec8]">Premium motion hero</div>
                            </div>
                        </div>

                        <div className="hidden items-center gap-5 md:flex">
                            <Link to="/claims" className="text-sm text-[#d7dde7] transition-colors hover:text-white">Claims</Link>
                            <Link to="/service-centers" className="text-sm text-[#d7dde7] transition-colors hover:text-white">Centers</Link>
                            <Link to="/configuration" className="text-sm text-[#d7dde7] transition-colors hover:text-white">Settings</Link>
                        </div>

                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d6ba79]/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))] text-xs font-semibold text-[#fff7e6]">
                                {initial}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition-colors hover:border-[#d6b56f]/35 hover:text-[#f7dfac]"
                                title="Logout"
                                aria-label="Logout"
                            >
                                <LogOut className="h-4 w-4" strokeWidth={1.9} />
                            </button>
                        </div>
                    </div>
                </header>

                <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 pb-10 pt-28 sm:px-8 sm:pt-32">
                    <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(340px,1fr)] lg:gap-14">
                        <div className="order-2 lg:order-1">
                            <div className="relative overflow-hidden rounded-[2.6rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-3 shadow-[0_40px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0)_36%,rgba(214,176,99,0.12)_100%)]" />
                                <div className="relative aspect-[16/11] overflow-hidden rounded-[2rem] border border-black/5 bg-[radial-gradient(circle_at_top,#ffffff_0%,#f5f7fa_52%,#e6ecf2_100%)]">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7),rgba(255,255,255,0)_58%)]" />
                                    <ScrollScrubVideo progress={scrollProgress} src={warrantyVaultVideo} />
                                </div>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2 lg:pl-2" style={copyStyle}>
                            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.34)] backdrop-blur-[18px] sm:p-8">
                                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d9bb79]/22 bg-[rgba(255,255,255,0.06)] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#f0ddb0]">
                                    <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                                    Smart Warranty Vault
                                </div>

                                <h1 className="max-w-lg text-4xl font-bold leading-[0.96] tracking-[-0.05em] text-white sm:text-5xl lg:text-[4.4rem]">
                                    The Future of Protection.
                                </h1>
                                <p className="mt-5 max-w-xl text-base leading-7 text-[#d8dee8] sm:text-lg">
                                    Every warranty, organized in a sleek 3D vault.
                                </p>

                                <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col">
                                    {featureItems.map((item, index) => {
                                        const Icon = item.icon;

                                        return (
                                            <div
                                                key={item.title}
                                                className="rounded-[1.4rem] border border-white/10 bg-[rgba(255,255,255,0.08)] px-4 py-4 backdrop-blur-[14px]"
                                                style={bubbleStyle(index * 0.12)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-[#d9bb79]/22 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] text-[#f0ddb0]">
                                                        <Icon className="h-5 w-5" strokeWidth={1.9} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-white">{item.title}</div>
                                                        <div className="mt-1 text-sm text-[#c1cad6]">{item.detail}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="absolute inset-x-0 bottom-8 z-20 px-4 sm:px-8">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 text-xs uppercase tracking-[0.24em] text-[#aab2be]">
                        <span>Scroll down to assemble into the vault</span>
                        <span>Scroll up to reverse the motion</span>
                    </div>
                </div>
            </div>

            <div className="relative z-0 h-[320vh]" />
        </div>
    );
};
