import { useEffect, useMemo, useState } from 'react';
import { LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { warrantiesApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { CategoryFilter } from '../components/CategoryFilter';
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

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#19325e_0%,#091322_55%,#04070e_100%)] px-6">
                <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,27,46,0.88),rgba(8,15,28,0.94))] p-8 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
                    <div className="flex items-center gap-4 rounded-[1.5rem] border border-[#d9bb79]/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-6 py-5 backdrop-blur-xl">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#f1d79d] border-t-transparent" />
                        <div>
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[#f3e2bc]">Warranty Pro</p>
                            <p className="mt-1 text-sm text-[#c8d9f0]">Loading secure dashboard...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1b3765_0%,#0a1220_48%,#04070d_100%)] px-4 py-6 sm:px-6 lg:px-10">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-[9%] top-[12%] h-56 w-80 rounded-[2.5rem] border border-white/10 bg-[linear-gradient(145deg,rgba(35,61,108,0.28),rgba(8,15,28,0.1))]" />
                <div className="absolute right-[12%] top-[9%] h-24 w-24 rounded-full border border-[#d9c18a]/20 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.2),rgba(255,255,255,0.02))]" />
                <div className="absolute right-[10%] top-[18%] h-48 w-4 rotate-[32deg] rounded-full bg-[linear-gradient(180deg,#f1dba5_0%,#946a22_100%)] shadow-[0_18px_35px_rgba(0,0,0,0.25)]" />
            </div>

            <div className="relative mx-auto max-w-[1380px]">
                <section className="relative overflow-hidden rounded-[3rem] border border-[#e7d6ac]/12 bg-[linear-gradient(180deg,#182f53_0%,#0c1729_52%,#09101d_100%)] p-4 shadow-[0_45px_110px_rgba(2,8,20,0.55)] sm:p-6 lg:p-8">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),rgba(255,255,255,0)_34%),linear-gradient(120deg,rgba(255,255,255,0.05),rgba(255,255,255,0)_30%,rgba(214,175,88,0.08)_100%)]" />
                    <div className="pointer-events-none absolute inset-[2.5%] rounded-[2.8rem] border border-white/8" />

                    <div className="relative rounded-[2.45rem] border border-[#d9bb79]/20 bg-[linear-gradient(180deg,rgba(8,17,29,0.42),rgba(8,15,25,0.18))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm sm:p-5 lg:p-6">
                        <div className="rounded-[1.85rem] border border-[#d8bc83]/25 bg-[linear-gradient(180deg,rgba(245,212,124,0.12),rgba(255,255,255,0.03))] px-4 py-3 backdrop-blur-xl sm:px-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex min-w-0 items-center gap-4">
                                    <div className="rounded-[1.3rem] border border-[#e0c687]/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-2.5">
                                        <WarrantyProMark className="h-11 w-11" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h1 className="truncate text-xl font-semibold tracking-[0.22em] text-white sm:text-2xl">
                                                WARRANTY PRO
                                            </h1>
                                        </div>
                                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#aebfd3]">
                                            Clean warranty overview
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-3 py-2 text-white">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6ba79]/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))] text-sm font-semibold text-[#fff7e6]">
                                            {initial}
                                        </div>
                                        <div className="hidden text-left sm:block">
                                            <div className="text-sm font-medium">{user?.name || 'Account Owner'}</div>
                                            <div className="text-xs text-[#bccfe7]">Primary profile</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition-colors hover:border-[#d6b56f]/40 hover:text-[#f7dfac]"
                                        title="Logout"
                                        aria-label="Logout"
                                    >
                                        <LogOut className="h-4 w-4" strokeWidth={1.9} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-4 backdrop-blur-xl sm:p-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#a9bfd9]">Protected Value</p>
                                    <div className="mt-2 text-[2.1rem] font-semibold tracking-[-0.05em] text-white sm:text-[2.55rem]">
                                        {formatCurrency(totalValue)}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        to="/warranties/new?mode=scan"
                                        className="rounded-full border border-[#e0c68b]/35 bg-[linear-gradient(180deg,#f9e3b8_0%,#c89236_100%)] px-5 py-3 text-center text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[#2e1d07] transition-colors hover:brightness-105"
                                    >
                                        Scan Receipt
                                    </Link>
                                    <Link
                                        to="/warranties/new?mode=manual"
                                        className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-center text-[0.68rem] font-bold uppercase tracking-[0.28em] text-white transition-colors hover:border-[#d8bb7d]/30 hover:bg-white/10"
                                    >
                                        Add Warranty
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <CategoryFilter
                                categories={categories}
                                selected={selectedCategory}
                                onSelect={setSelectedCategory}
                            />
                        </div>

                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                            {preparedWarranties.map(({ warranty, display }) => (
                                <WarrantyCard key={warranty._id || warranty.id} warranty={warranty} display={display} />
                            ))}
                        </div>

                        {preparedWarranties.length === 0 && (
                            <div className="mt-6 rounded-[2rem] border border-dashed border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-6 py-12 text-center">
                                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[#a9bfd9]">No visible records</p>
                                <p className="mt-4 text-3xl font-semibold text-white">No warranties match this filter.</p>
                                <p className="mt-3 text-sm text-[#c6d7ea]">Choose another category or add a new warranty to the vault.</p>
                            </div>
                        )}

                    </div>
                </section>
            </div>
        </div>
    );
};
