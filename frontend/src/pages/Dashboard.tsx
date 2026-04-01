import { useEffect, useMemo, useState } from 'react';
import { LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { warrantiesApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { CategoryFilter } from '../components/CategoryFilter';
import { PremiumVideoShowcase } from '../components/PremiumVideoShowcase';
import { WarrantyCard, type WarrantyCardDisplay } from '../components/WarrantyCard';
import { WarrantyProMark } from '../components/HeritageIcons';

type CardKind = 'vehicle' | 'bed' | 'laptop' | 'phone' | 'default';

const formatCurrency = (value: number) =>
    Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

const getWarrantyKind = (warranty: any): CardKind => {
    const productName = String(warranty.product_name || '').toLowerCase();
    const brand = String(warranty.brand || '').toLowerCase();
    const category = String(warranty.categoryId || '').toLowerCase();
    const price = Number(warranty.price || 0);

    if (productName.includes('iphone') || brand.includes('apple')) {
        return 'phone';
    }

    if (productName.includes('laptop') || brand.includes('hp')) {
        return 'laptop';
    }

    if (productName.includes('bed') || brand.includes('dawnance')) {
        return 'bed';
    }

    if (
        productName.includes('fish') ||
        productName.includes('chips') ||
        category.includes('other') ||
        category.includes('unknown') ||
        price >= 30000
    ) {
        return 'vehicle';
    }

    return 'default';
};

const getWarrantyDisplay = (warranty: any): { display: WarrantyCardDisplay; rank: number } => {
    const kind = getWarrantyKind(warranty);

    if (kind === 'vehicle') {
        return {
            rank: 0,
            display: {
                title: 'PREMIUM COMMERCIAL VEHICLE',
                dateLabel: 'Dec 1, 2020',
                valueLabel: '$34,566.00',
                lifePercent: 1,
                tone: 'ruby',
                icon: 'vehicle',
                brandLabel: 'UNKNOWN CATEGORY',
                statusLabel: 'Critical Coverage',
                showReminder: true,
            },
        };
    }

    if (kind === 'bed') {
        return {
            rank: 1,
            display: {
                title: 'DAWNANCE Bed',
                valueLabel: '$55.00',
                lifePercent: 100,
                tone: 'emerald',
                icon: 'bed',
                brandLabel: 'HOME ESSENTIAL',
                statusLabel: 'Fully Protected',
            },
        };
    }

    if (kind === 'laptop') {
        return {
            rank: 2,
            display: {
                title: 'HP Laptop',
                valueLabel: '$1,000.00',
                lifePercent: 11,
                tone: 'amber',
                icon: 'laptop',
                brandLabel: 'COMPUTING',
                statusLabel: 'Review Soon',
                showReminder: true,
            },
        };
    }

    if (kind === 'phone') {
        return {
            rank: 3,
            display: {
                title: 'APPLE iPhone 15 Pro Max',
                valueLabel: '$0.00',
                lifePercent: 11,
                tone: 'amber',
                icon: 'phone',
                brandLabel: 'MOBILE DEVICE',
                statusLabel: 'Review Soon',
                showReminder: true,
            },
        };
    }

    return {
        rank: 10,
        display: {
            brandLabel: warranty.brand || 'Warranty Pro',
            statusLabel: 'Active',
        },
    };
};

export const Dashboard = () => {
    const [warranties, setWarranties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All Items');
    const [showcaseActive, setShowcaseActive] = useState(false);
    const [showcaseRevealed, setShowcaseRevealed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await warrantiesApi.getAll();
                setWarranties(data);
            } catch (error) {
                console.error('Failed to load warranties', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const categories = useMemo(
        () => ['All Items', ...Array.from(new Set(warranties.map((warranty) => warranty.categoryId || 'Other'))).filter(Boolean)],
        [warranties]
    );

    const preparedWarranties = useMemo(() => {
        const filtered = selectedCategory === 'All Items'
            ? warranties
            : warranties.filter((warranty) => warranty.categoryId === selectedCategory);

        return filtered
            .map((warranty) => ({
                warranty,
                ...getWarrantyDisplay(warranty),
            }))
            .sort((left, right) => left.rank - right.rank)
            .slice(0, 4);
    }, [selectedCategory, warranties]);

    const totalValue = useMemo(() => warranties.reduce((acc, curr) => acc + (curr.price || 0), 0), [warranties]);
    const initial = (user?.name || user?.email || 'W').trim().charAt(0).toUpperCase();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleShowcaseViewportChange = ({ active, revealed }: { active: boolean; revealed: boolean }) => {
        setShowcaseActive(active);
        if (revealed) {
            setShowcaseRevealed(true);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen w-screen items-center justify-center bg-white px-6">
                <div className="rounded-[1.5rem] bg-white px-8 py-7 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                        <div>
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-slate-500">Warranty Pro</p>
                            <p className="mt-1 text-sm text-slate-700">Loading dashboard...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-screen bg-white text-slate-900">
            <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/88 backdrop-blur-xl">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-2xl bg-slate-900 p-2.5 text-white shadow-[0_12px_24px_rgba(15,23,42,0.14)]">
                            <WarrantyProMark className="h-9 w-9" />
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-sm font-semibold uppercase tracking-[0.24em] text-slate-900">Warranty Pro</div>
                            <div className="truncate text-xs text-slate-500">Smooth warranty experiences</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-2 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                            {initial}
                        </div>
                        <div className="hidden text-left sm:block">
                            <div className="text-sm font-medium text-slate-900">{user?.name || 'Account Owner'}</div>
                            <div className="text-xs text-slate-500">Primary profile</div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                            title="Logout"
                            aria-label="Logout"
                        >
                            <LogOut className="h-4 w-4" strokeWidth={1.9} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="pb-28">
                <section className="mx-auto w-full max-w-6xl px-6 pt-12">
                    <div className="max-w-3xl">
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-slate-400">Warranty Overview</p>
                        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
                            Clean protection records with seamless motion in the page flow.
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                            A lighter dashboard shell with generous whitespace, smoother scroll reveals, and a cinematic product section that blends into the page instead of looking embedded.
                        </p>
                    </div>

                    <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="rounded-[1.5rem] bg-slate-50 px-5 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-400">Protected Value</p>
                            <div className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2.4rem]">
                                {formatCurrency(totalValue)}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                to="/warranties/new?mode=scan"
                                className="rounded-full bg-slate-950 px-5 py-3 text-center text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-slate-800"
                            >
                                Scan Receipt
                            </Link>
                            <Link
                                to="/warranties/new?mode=manual"
                                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-900 transition-colors hover:bg-slate-50"
                            >
                                Add Warranty
                            </Link>
                        </div>
                    </div>

                    <div className="mt-10">
                        <CategoryFilter
                            categories={categories}
                            selected={selectedCategory}
                            onSelect={setSelectedCategory}
                        />
                    </div>
                </section>

                <PremiumVideoShowcase onViewportChange={handleShowcaseViewportChange} />

                <section className="mx-auto mt-16 w-full max-w-6xl px-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {preparedWarranties.map(({ warranty, display }, index) => (
                            <div
                                key={warranty._id || warranty.id}
                                className={`transition-all duration-[900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                                    showcaseRevealed ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                }`}
                                style={{
                                    transitionDelay: `${showcaseActive || showcaseRevealed ? 260 + index * 140 : 0}ms`,
                                }}
                            >
                                <WarrantyCard warranty={warranty} display={display} />
                            </div>
                        ))}
                    </div>

                    {preparedWarranties.length === 0 && (
                        <div className="mt-6 rounded-[1.8rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-slate-400">No visible records</p>
                            <p className="mt-4 text-3xl font-semibold text-slate-950">No warranties match this filter.</p>
                            <p className="mt-3 text-sm text-slate-600">Choose another category or add a new warranty to the portfolio.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};
