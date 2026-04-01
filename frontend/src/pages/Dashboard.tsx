import { useEffect, useMemo, useRef, useState } from 'react';
import { BellRing, Boxes, LogOut, ScanLine, ScanSearch, ShieldCheck, Sparkles, SquarePen } from 'lucide-react';
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

const featureTiles = [
    {
        title: 'AI receipt intake',
        description: 'Capture receipts in seconds and turn them into structured warranty records without manual cleanup.',
        icon: ScanLine,
        tone: 'sky',
    },
    {
        title: 'Smart expiry monitoring',
        description: 'Surface renewals and coverage risk early so you never discover an expired warranty too late.',
        icon: BellRing,
        tone: 'amber',
    },
    {
        title: 'Claim-ready organization',
        description: 'Keep purchase proof, coverage dates, and product details lined up for a faster support workflow.',
        icon: ShieldCheck,
        tone: 'emerald',
    },
    {
        title: 'Portfolio visibility',
        description: 'See the value and health of all products in one dashboard instead of scattered emails and folders.',
        icon: Boxes,
        tone: 'slate',
    },
];

const workflowSteps = [
    {
        title: 'Capture the proof',
        description: 'Scan a receipt with AI or create the record manually with the exact product details you want to keep.',
    },
    {
        title: 'Let WarrantyPro organize it',
        description: 'The platform stores dates, value, and product history in one calm workspace built for quick lookup.',
    },
    {
        title: 'Act before it becomes urgent',
        description: 'Use reminders, portfolio health, and claim flows to respond while coverage is still active.',
    },
];

export const Dashboard = () => {
    const [warranties, setWarranties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All Items');
    const [showcaseActive, setShowcaseActive] = useState(false);
    const [showcaseRevealed, setShowcaseRevealed] = useState(false);
    const [workflowVisible, setWorkflowVisible] = useState(false);
    const workflowRef = useRef<HTMLDivElement>(null);
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

    useEffect(() => {
        const section = workflowRef.current;
        if (!section || workflowVisible) {
            return;
        }

        const revealIfVisible = () => {
            const rect = section.getBoundingClientRect();
            const triggerLine = window.innerHeight * 0.88;
            if (rect.top <= triggerLine) {
                setWorkflowVisible(true);
                return true;
            }
            return false;
        };

        if (revealIfVisible()) {
            return;
        }

        const handleScroll = () => {
            if (revealIfVisible()) {
                window.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', handleScroll);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [workflowVisible]);

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
    const expiringSoonCount = useMemo(() => {
        const now = new Date();

        return warranties.filter((warranty) => {
            if (!warranty.purchase_date || !warranty.warranty_duration_months) {
                return false;
            }

            const expiryDate = new Date(warranty.purchase_date);
            expiryDate.setMonth(expiryDate.getMonth() + Number(warranty.warranty_duration_months || 0));
            const daysLeft = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            return daysLeft >= 0 && daysLeft <= 45;
        }).length;
    }, [warranties]);
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
                <div className="rounded-[1.5rem] bg-[#fbfbfc] px-8 py-7 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
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
        <div className="min-h-screen w-screen bg-white text-[#111111]">
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm">
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
                        <div className="flex items-center gap-2 rounded-full bg-[#f8fafc] px-2.5 py-2">
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
                    <div className="overflow-hidden rounded-[2rem] bg-white px-6 py-10 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:px-8 lg:px-10">
                        <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-1 py-1">
                            <div className="pointer-events-none absolute left-[-3rem] top-[-5rem] h-44 w-44 rounded-full bg-sky-100/70 blur-3xl" />
                            <div className="pointer-events-none absolute right-[-4rem] top-10 h-56 w-56 rounded-full bg-slate-100 blur-3xl" />
                            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.88fr)] lg:items-start">
                                <div className="max-w-4xl px-2 py-2">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-sky-700 shadow-[0_8px_20px_rgba(56,189,248,0.08)]">
                                        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                                        WarrantyPro Workspace
                                    </div>
                                    <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-[#111111] sm:text-5xl lg:text-6xl">
                                        Save, track, and claim every warranty from one premium dashboard.
                                    </h1>
                                    <HeadingAccent />
                                    <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                                        WarrantyPro turns receipts, coverage dates, and product records into a calm operating layer, so every claim starts organized instead of rushed.
                                    </p>

                                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                        <Link
                                            to="/warranties/new?mode=scan"
                                            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                                        >
                                            <ScanSearch className="h-4 w-4" strokeWidth={2} />
                                            Scan Receipt with AI
                                        </Link>
                                        <Link
                                            to="/warranties/new?mode=manual"
                                            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
                                        >
                                            <SquarePen className="h-4 w-4" strokeWidth={2} />
                                            Add Warranty Manually
                                        </Link>
                                    </div>

                                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                        <div className="rounded-[1.4rem] border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
                                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-400">Protected Value</p>
                                            <div className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[#111111]">
                                                {formatCurrency(totalValue)}
                                            </div>
                                        </div>
                                        <div className="rounded-[1.4rem] border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
                                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-400">Live Records</p>
                                            <div className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[#111111]">
                                                {warranties.length}
                                            </div>
                                        </div>
                                        <div className="rounded-[1.4rem] border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
                                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-400">Review Soon</p>
                                            <div className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[#111111]">
                                                {expiringSoonCount}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[1.8rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_38px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6">
                                    <div className="flex items-start gap-3 text-slate-700">
                                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                                            <ScanSearch className="h-4.5 w-4.5" strokeWidth={2} />
                                        </div>
                                        <div>
                                            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Smart Intake</p>
                                            <p className="mt-1 text-lg font-semibold text-slate-900">Bring every receipt into one trusted system.</p>
                                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                                Start with AI extraction for speed, then move into manual detail control whenever a product needs extra precision.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        <div className="rounded-[1.25rem] bg-[#f8fafc] px-4 py-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Best for fast entry</p>
                                            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">Snap the proof, extract the fields, and review before saving.</p>
                                        </div>
                                        <div className="rounded-[1.25rem] bg-[#f8fafc] px-4 py-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Best for exact records</p>
                                            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">Add product history yourself when coverage terms or notes need careful handling.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-14">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#111111]">Core Features</h2>
                                <HeadingAccent />
                            </div>
                            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {featureTiles.map((tile) => {
                                    const Icon = tile.icon;
                                    const toneClasses = tile.tone === 'sky'
                                        ? 'border-sky-200 bg-sky-50 text-sky-700'
                                        : tile.tone === 'amber'
                                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                                            : tile.tone === 'emerald'
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                : 'border-slate-200 bg-slate-50 text-slate-700';

                                    return (
                                        <div key={tile.title} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-transform duration-300 hover:-translate-y-1">
                                            <div className={`inline-flex rounded-2xl border p-3 ${toneClasses}`}>
                                                <Icon className="h-5 w-5" strokeWidth={2} />
                                            </div>
                                            <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em] text-slate-950">{tile.title}</h3>
                                            <p className="mt-3 text-sm leading-7 text-slate-600">{tile.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div ref={workflowRef} className="mt-14">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#111111]">How It Works</h2>
                                <HeadingAccent />
                            </div>
                            <div className="mt-8 grid gap-4 lg:grid-cols-3">
                                {workflowSteps.map((step, index) => (
                                    <div
                                        key={step.title}
                                        className="rounded-[1.6rem] border border-slate-200 bg-[#fbfdff] p-6 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-all duration-[850ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
                                        style={{
                                            opacity: workflowVisible ? 1 : 0,
                                            transform: workflowVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 26px, 0)',
                                            transitionDelay: `${160 + index * 180}ms`,
                                        }}
                                    >
                                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                                            {index + 1}
                                        </div>
                                        <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em] text-slate-950">{step.title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
                                    </div>
                                ))}
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
                    <div className="rounded-[2rem] bg-white px-6 py-10 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:px-8 lg:px-10">
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
