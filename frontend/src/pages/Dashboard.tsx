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

const HeadingAccent = () => (
    <span className="mt-4 block h-[3px] w-16 rounded-full bg-[#38bdf8]" />
);

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
            <div className="flex min-h-screen w-screen items-center justify-center bg-[#87CEEB] px-6">
                <div className="rounded-[1.5rem] bg-white px-8 py-7 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                        <div>
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-slate-400">Warranty Pro</p>
                            <p className="mt-1 text-sm text-slate-700">Loading dashboard...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-screen bg-[#87CEEB] text-[#111111]">
            <header className="sticky top-0 z-30 bg-[#87CEEB]">
                <div className="flex w-full items-center justify-between gap-4 px-6 py-5 sm:px-10 lg:px-16">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-2xl bg-slate-950 p-2.5 text-white">
                            <WarrantyProMark className="h-9 w-9" />
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-sm font-semibold uppercase tracking-[0.24em] text-[#111111]">Warranty Pro</div>
                            <div className="truncate text-xs text-slate-600">Clean protection dashboard</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/claims" className="hidden text-sm text-slate-700 transition-colors hover:text-slate-950 sm:block">Claims</Link>
                        <Link to="/service-centers" className="hidden text-sm text-slate-700 transition-colors hover:text-slate-950 sm:block">Centers</Link>
                        <div className="flex items-center gap-2 rounded-full bg-white/80 px-2.5 py-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                                {initial}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="rounded-full bg-white p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
                                title="Logout"
                                aria-label="Logout"
                            >
                                <LogOut className="h-4 w-4" strokeWidth={1.9} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="w-full pb-28">
                <section className="w-full px-6 pt-10 sm:px-10 lg:px-16">
                    <div className="overflow-hidden rounded-[2rem] bg-white px-6 py-10 shadow-[0_20px_44px_rgba(15,23,42,0.08)] sm:px-8 lg:px-10">
                        <div className="max-w-4xl">
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-slate-400">Warranty Overview</p>
                            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#111111] sm:text-5xl lg:text-6xl">
                                Save every warranty in one clean, professional workflow.
                            </h1>
                            <HeadingAccent />
                            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                                WarrantyPro keeps documents, expiries, and purchase records together so your claims and product history stay easy to access.
                            </p>
                        </div>

                        <div className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="rounded-[1.4rem] bg-slate-50 px-5 py-4">
                                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-400">Protected Value</p>
                                <div className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[#111111] sm:text-[2.5rem]">
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
                                    className="rounded-full bg-slate-100 px-5 py-3 text-center text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-900 transition-colors hover:bg-slate-200"
                                >
                                    Add Warranty
                                </Link>
                            </div>
                        </div>

                        <div className="mt-12">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#111111]">Portfolio Filters</h2>
                                <HeadingAccent />
                            </div>
                            <div className="mt-6">
                                <CategoryFilter
                                    categories={categories}
                                    selected={selectedCategory}
                                    onSelect={setSelectedCategory}
                                />
                            </div>
                        </div>

                        <PremiumVideoShowcase onViewportChange={handleShowcaseViewportChange} />
                    </div>
                </section>

                <section className="w-full px-6 pt-16 sm:px-10 lg:px-16">
                    <div className="rounded-[2rem] bg-white px-6 py-10 shadow-[0_20px_44px_rgba(15,23,42,0.08)] sm:px-8 lg:px-10">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#111111]">Warranties</h2>
                            <HeadingAccent />
                        </div>

                        <div className="mt-8 grid gap-6 md:grid-cols-2">
                            {preparedWarranties.map(({ warranty, display }, index) => (
                                <div
                                    key={warranty._id || warranty.id}
                                    className={`transition-all duration-[900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                                        showcaseRevealed ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                    }`}
                                    style={{
                                        transitionDelay: `${showcaseActive || showcaseRevealed ? 220 + index * 120 : 0}ms`,
                                    }}
                                >
                                    <WarrantyCard warranty={warranty} display={display} />
                                </div>
                            ))}
                        </div>

                        {preparedWarranties.length === 0 && (
                            <div className="mt-8 rounded-[1.8rem] bg-slate-50 px-6 py-14 text-center">
                                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-slate-400">No visible records</p>
                                <p className="mt-4 text-3xl font-semibold text-[#111111]">No warranties match this filter.</p>
                                <p className="mt-3 text-sm text-slate-600">Choose another category or add a new warranty to the portfolio.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};
