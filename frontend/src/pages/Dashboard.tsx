import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowUpDown, BadgeCheck, BellRing, Boxes, Check, ChevronDown, CirclePlus, Cloud, LockKeyhole, LogOut, ScanLine, ScanSearch, Search, ShieldCheck, Sparkles, SquarePen, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { warrantiesApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { CategoryFilter } from '../components/CategoryFilter';
import { PremiumVideoShowcase } from '../components/PremiumVideoShowcase';
import { WarrantyCard, type WarrantyCardDisplay } from '../components/WarrantyCard';
import { WarrantyProMark } from '../components/HeritageIcons';
import { DeleteWarrantyModal } from '../components/ui/DeleteWarrantyModal';

type CardKind = 'vehicle' | 'bed' | 'laptop' | 'phone' | 'default';
type FeatureAction = 'intake' | 'expiry' | 'claims' | 'portfolio';
type FeatureModal = 'intake' | 'expiry' | null;

const formatCurrency = (value: number) =>
    Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

const formatDateLabel = (value: string | Date) =>
    new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));

const getSafeDate = (value: unknown) => {
    if (!value) {
        return null;
    }

    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? null : date;
};

const getExpiryMeta = (warranty: any) => {
    const purchaseDate = getSafeDate(warranty.purchase_date);
    const durationMonths = Number(warranty.warranty_duration_months || 0);

    if (!purchaseDate || !Number.isFinite(durationMonths) || durationMonths <= 0) {
        return null;
    }

    const expiryDate = new Date(purchaseDate);
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

    if (Number.isNaN(expiryDate.getTime())) {
        return null;
    }

    const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return {
        expiryDate,
        daysLeft,
    };
};

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

const floatingLoop = {
    duration: 5.2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
};

const featureTiles = [
    {
        title: 'AI receipt intake',
        description: 'Capture receipts in seconds and turn them into structured warranty records without manual cleanup.',
        icon: ScanLine,
        tone: 'sky',
        action: 'intake' as FeatureAction,
        hint: 'Choose AI scan or manual entry',
    },
    {
        title: 'Smart expiry monitoring',
        description: 'Surface renewals and coverage risk early so you never discover an expired warranty too late.',
        icon: BellRing,
        tone: 'amber',
        action: 'expiry' as FeatureAction,
        hint: 'Open upcoming expiry alerts',
    },
    {
        title: 'Claim-ready organization',
        description: 'Keep purchase proof, coverage dates, and product details lined up for a faster support workflow.',
        icon: ShieldCheck,
        tone: 'emerald',
        action: 'claims' as FeatureAction,
        hint: 'Go to claims workspace',
    },
    {
        title: 'Portfolio visibility',
        description: 'See the value and health of all products in one dashboard instead of scattered emails and folders.',
        icon: Boxes,
        tone: 'slate',
        action: 'portfolio' as FeatureAction,
        hint: 'Jump to all warranty records',
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

const pricingTiers = [
    {
        name: 'Starter',
        price: '$0',
        cadence: '/month',
        description: 'A clean starting point for personal products and a lighter receipt flow.',
        ctaLabel: 'Start With Manual Entry',
        ctaTo: '/warranties/new?mode=manual',
        featured: false,
        features: [
            'Manual warranty records',
            'Basic expiry reminders',
            'Single-user dashboard',
        ],
    },
    {
        name: 'Pro',
        price: '$12',
        cadence: '/month',
        description: 'The best day-to-day setup for fast AI intake, reminders, and claim-ready records.',
        ctaLabel: 'Use AI Receipt Flow',
        ctaTo: '/warranties/new?mode=scan',
        featured: true,
        features: [
            'AI receipt scanning',
            'Smart expiry monitoring',
            'Claim-ready organization',
            'Priority reminders',
        ],
    },
    {
        name: 'Family',
        price: '$24',
        cadence: '/month',
        description: 'A shared protection layer for households managing multiple products and renewals.',
        ctaLabel: 'Explore Claims Workspace',
        ctaTo: '/claims',
        featured: false,
        features: [
            'Shared household visibility',
            'Portfolio-level tracking',
            'Renewal planning',
            'Faster claim preparation',
        ],
    },
];

const trustSignals = [
    {
        label: 'Protected records',
        value: 'Bank-grade clarity',
        description: 'Every purchase, date, and claim note stays organized inside one focused flow.',
    },
    {
        label: 'Renewal awareness',
        value: '45-day early watch',
        description: 'Smart monitoring surfaces expiring coverage before it turns into an urgent problem.',
    },
    {
        label: 'Claim confidence',
        value: 'Faster support prep',
        description: 'Proof of purchase and product details stay ready when you need to file a claim.',
    },
];

const heroTrustBadges = [
    { label: 'Encrypted records', icon: LockKeyhole },
    { label: 'Cloud synced', icon: Cloud },
    { label: 'Claim-ready proofs', icon: BadgeCheck },
];

const pricingTrustBadges = [
    { label: 'No hidden fees', icon: BadgeCheck },
    { label: 'Secure billing flow', icon: LockKeyhole },
    { label: 'Cancel anytime', icon: Cloud },
];

const faqItems = [
    {
        question: 'Can I choose between AI scan and manual entry each time?',
        answer: 'Yes. WarrantyPro supports both flows, so you can scan quick receipts with AI or switch to manual entry whenever a product needs extra precision.',
    },
    {
        question: 'How does expiry monitoring work?',
        answer: 'The dashboard calculates warranty end dates from your saved purchase date and duration, then surfaces upcoming renewals before they become urgent.',
    },
    {
        question: 'Can I manage more than one product category in one place?',
        answer: 'Yes. Phones, laptops, vehicles, home products, and mixed categories can all live in one portfolio with filters and unified claim prep.',
    },
    {
        question: 'What happens when I need to file a claim?',
        answer: 'Your product details, dates, and proof stay lined up inside the claim flow, so you are not scrambling through folders when support asks for documents.',
    },
];

export const Dashboard = () => {
    const [warranties, setWarranties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All Items');
    const [portfolioView, setPortfolioView] = useState<'all' | 'expiring' | 'highValue' | 'recent'>('all');
    const [savedPortfolioView, setSavedPortfolioView] = useState<'balanced' | 'renewals' | 'highValue' | 'fresh'>('balanced');
    const [portfolioSearch, setPortfolioSearch] = useState('');
    const [portfolioSort, setPortfolioSort] = useState<'priority' | 'value' | 'recent' | 'expiry'>('priority');
    const [showcaseActive, setShowcaseActive] = useState(false);
    const [showcaseRevealed, setShowcaseRevealed] = useState(false);
    const [activeFeatureModal, setActiveFeatureModal] = useState<FeatureModal>(null);
    const [activeFaq, setActiveFaq] = useState(0);
    const [deletingWarrantyId, setDeletingWarrantyId] = useState<string | null>(null);
    const [pendingDeleteWarranty, setPendingDeleteWarranty] = useState<any | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const warrantiesSectionRef = useRef<HTMLElement | null>(null);

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
        const normalizedQuery = portfolioSearch.trim().toLowerCase();
        const filtered = (selectedCategory === 'All Items'
            ? warranties
            : warranties.filter((warranty) => warranty.categoryId === selectedCategory))
            .filter((warranty) => {
                if (portfolioView === 'expiring') {
                    const daysLeft = getExpiryMeta(warranty)?.daysLeft;
                    return typeof daysLeft === 'number' && daysLeft >= 0 && daysLeft <= 45;
                }

                if (portfolioView === 'highValue') {
                    return Number(warranty.price || 0) >= 1000;
                }

                if (portfolioView === 'recent') {
                    const purchaseDate = getSafeDate(warranty.purchase_date);
                    if (!purchaseDate) {
                        return false;
                    }

                    return Date.now() - purchaseDate.getTime() <= 1000 * 60 * 60 * 24 * 120;
                }

                return true;
            })
            .filter((warranty) => {
                if (!normalizedQuery) {
                    return true;
                }

                const product = String(warranty.product_name || '').toLowerCase();
                const brand = String(warranty.brand || '').toLowerCase();
                const category = String(warranty.categoryId || '').toLowerCase();
                return product.includes(normalizedQuery) || brand.includes(normalizedQuery) || category.includes(normalizedQuery);
            });

        return filtered
            .map((warranty) => ({
                warranty,
                ...getWarrantyDisplay(warranty),
            }))
            .sort((left, right) => {
                if (portfolioSort === 'value') {
                    return Number(right.warranty.price || 0) - Number(left.warranty.price || 0);
                }

                if (portfolioSort === 'recent') {
                    return (getSafeDate(right.warranty.purchase_date)?.getTime() || 0) - (getSafeDate(left.warranty.purchase_date)?.getTime() || 0);
                }

                if (portfolioSort === 'expiry') {
                    const leftDays = getExpiryMeta(left.warranty)?.daysLeft ?? Number.MAX_SAFE_INTEGER;
                    const rightDays = getExpiryMeta(right.warranty)?.daysLeft ?? Number.MAX_SAFE_INTEGER;
                    return leftDays - rightDays;
                }

                return left.rank - right.rank;
            });
    }, [portfolioSearch, portfolioSort, portfolioView, selectedCategory, warranties]);

    const totalValue = useMemo(() => warranties.reduce((acc, curr) => acc + (curr.price || 0), 0), [warranties]);
    const expiringSoonItems = useMemo(() => {
        return warranties
            .map((warranty) => {
                const expiryMeta = getExpiryMeta(warranty);

                if (!expiryMeta || expiryMeta.daysLeft < 0 || expiryMeta.daysLeft > 45) {
                    return null;
                }

                return {
                    warranty,
                    ...expiryMeta,
                };
            })
            .filter((item): item is { warranty: any; expiryDate: Date; daysLeft: number } => item !== null)
            .sort((left, right) => left.daysLeft - right.daysLeft);
    }, [warranties]);
    const expiringSoonCount = expiringSoonItems.length;
    const highValueCount = useMemo(
        () => warranties.filter((warranty) => Number(warranty.price || 0) >= 1000).length,
        [warranties]
    );
    const recentCount = useMemo(
        () =>
            warranties.filter((warranty) => {
                const purchaseDate = getSafeDate(warranty.purchase_date);
                return purchaseDate ? Date.now() - purchaseDate.getTime() <= 1000 * 60 * 60 * 24 * 120 : false;
            }).length,
        [warranties]
    );
    const onboardingSteps = useMemo(() => {
        const hasRecords = warranties.length > 0;

        return [
            {
                title: hasRecords ? 'Keep your intake flowing' : 'Add your first receipt',
                description: hasRecords
                    ? 'Your vault is active. Keep using AI scan or manual entry as new purchases come in.'
                    : 'Start with AI receipt scan to create your first structured warranty record in seconds.',
                eyebrow: hasRecords ? 'Vault ready' : 'Start here',
                icon: ScanLine,
                tone: 'sky',
                actionLabel: hasRecords ? 'Add another warranty' : 'Open AI intake',
                onClick: () => handleFeatureAction('intake'),
            },
            {
                title: hasRecords ? 'Review smart reminders' : 'Turn on coverage awareness',
                description: hasRecords
                    ? expiringSoonCount > 0
                        ? `${expiringSoonCount} product${expiringSoonCount === 1 ? '' : 's'} need attention soon. Open the reminder queue before coverage slips.`
                        : 'Monitoring is active. Open the reminder queue anytime to review upcoming renewals.'
                    : 'Once you save a warranty, WarrantyPro will start watching dates and surface upcoming renewals.',
                eyebrow: hasRecords ? 'Monitoring active' : 'Needs records',
                icon: BellRing,
                tone: 'amber',
                actionLabel: 'Open reminders',
                onClick: () => handleFeatureAction('expiry'),
            },
            {
                title: hasRecords ? 'Keep claims workspace ready' : 'Preview the claims flow',
                description: hasRecords
                    ? 'Your product records can move straight into claim prep whenever support is needed.'
                    : 'See how WarrantyPro keeps proof, dates, and notes lined up before you ever need support.',
                eyebrow: hasRecords ? 'Claim-ready setup' : 'Explore next',
                icon: ShieldCheck,
                tone: 'emerald',
                actionLabel: 'Go to claims',
                onClick: () => handleFeatureAction('claims'),
            },
        ];
    }, [expiringSoonCount, warranties.length]);
    const onboardingProgress = onboardingSteps.filter((step) => step.eyebrow !== 'Start here' && step.eyebrow !== 'Needs records').length;
    const initial = (user?.name || user?.email || 'W').trim().charAt(0).toUpperCase();

    const applySavedPortfolioView = (view: 'balanced' | 'renewals' | 'highValue' | 'fresh') => {
        setSavedPortfolioView(view);

        if (view === 'balanced') {
            setPortfolioView('all');
            setPortfolioSort('priority');
            setPortfolioSearch('');
            return;
        }

        if (view === 'renewals') {
            setPortfolioView('expiring');
            setPortfolioSort('expiry');
            setPortfolioSearch('');
            return;
        }

        if (view === 'highValue') {
            setPortfolioView('highValue');
            setPortfolioSort('value');
            setPortfolioSearch('');
            return;
        }

        setPortfolioView('recent');
        setPortfolioSort('recent');
        setPortfolioSearch('');
    };

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

    const handleFeatureAction = (action: FeatureAction) => {
        if (action === 'intake') {
            setActiveFeatureModal('intake');
            return;
        }

        if (action === 'expiry') {
            setActiveFeatureModal('expiry');
            return;
        }

        if (action === 'claims') {
            navigate('/claims');
            return;
        }

        setShowcaseRevealed(true);
        warrantiesSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    const closeFeatureModal = () => setActiveFeatureModal(null);

    const handleIntakeChoice = (mode: 'scan' | 'manual') => {
        setActiveFeatureModal(null);
        navigate(`/warranties/new?mode=${mode}`);
    };

    const handleExpiryItemClick = (warrantyId: string) => {
        setActiveFeatureModal(null);
        navigate(`/warranties/${warrantyId}`);
    };

    const openDeleteWarranty = (warranty: any) => {
        setDeleteError(null);
        setPendingDeleteWarranty(warranty);
    };

    const closeDeleteWarranty = () => {
        if (deletingWarrantyId) {
            return;
        }

        setDeleteError(null);
        setPendingDeleteWarranty(null);
    };

    const handleDeleteWarranty = async () => {
        const warranty = pendingDeleteWarranty;
        const warrantyId = warranty?._id || warranty?.id;
        if (!warrantyId) {
            return;
        }

        try {
            setDeleteError(null);
            setDeletingWarrantyId(warrantyId);
            await warrantiesApi.deleteOne(warrantyId);
            setWarranties((current) => current.filter((item) => (item._id || item.id) !== warrantyId));
            setPendingDeleteWarranty(null);
        } catch (error) {
            console.error('Failed to delete warranty', error);
            setDeleteError('Warranty could not be deleted right now. Please try again.');
        } finally {
            setDeletingWarrantyId(null);
        }
    };

    useEffect(() => {
        const hasOverlay = Boolean(activeFeatureModal || pendingDeleteWarranty);
        if (!hasOverlay) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (pendingDeleteWarranty && !deletingWarrantyId) {
                    closeDeleteWarranty();
                    return;
                }

                setActiveFeatureModal(null);
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [activeFeatureModal, pendingDeleteWarranty, deletingWarrantyId]);

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
            <header className="sticky top-0 z-30 px-4 pt-4 sm:px-8 sm:pt-5 lg:px-16">
                <div className="glass-floating-nav mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 rounded-[1.9rem] px-4 py-3 sm:px-5 sm:py-4">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <motion.div
                            className="rounded-[1.35rem] bg-slate-950 p-2.5 text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)]"
                            animate={{ y: [0, -3, 0], scale: [1, 1.015, 1] }}
                            transition={{ ...floatingLoop, duration: 4.6 }}
                        >
                            <WarrantyProMark className="h-9 w-9" />
                        </motion.div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <div className="truncate text-sm font-semibold uppercase tracking-[0.24em] text-[#111111]">Warranty Pro</div>
                                <motion.span
                                    className="hidden rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-sky-700 sm:inline-flex"
                                    animate={{ y: [0, -1.5, 0], opacity: [0.92, 1, 0.92] }}
                                    transition={{ ...floatingLoop, duration: 4.8 }}
                                >
                                    Protected Workspace
                                </motion.span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                <span>Clean protection dashboard</span>
                                <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
                                <span className="hidden sm:inline">Claims, reminders, and proof in one place</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-2 py-1.5 sm:flex">
                            <Link to="/claims" className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950">Claims</Link>
                            <Link to="/service-centers" className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950">Centers</Link>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-[#f8fafc] px-2.5 py-2 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
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

            <main className="w-full pb-24 sm:pb-28">
                <section className="w-full px-4 pt-6 sm:px-8 sm:pt-10 lg:px-16">
                    <div className="overflow-hidden rounded-[1.5rem] bg-white px-4 py-6 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:rounded-[2rem] sm:px-8 sm:py-10 lg:px-10">
                        <div className="relative overflow-hidden rounded-[1.6rem] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-1 py-1 sm:rounded-[2rem]">
                            <div className="pointer-events-none absolute left-[-3rem] top-[-5rem] h-44 w-44 rounded-full bg-sky-100/70 blur-3xl" />
                            <div className="pointer-events-none absolute right-[-4rem] top-10 h-56 w-56 rounded-full bg-slate-100 blur-3xl" />
                            <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.88fr)] lg:gap-10 lg:items-start">
                                <div className="max-w-4xl px-1 py-1 sm:px-2 sm:py-2">
                                    <motion.div
                                        className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-sky-700 shadow-[0_8px_20px_rgba(56,189,248,0.08)] sm:px-4 sm:text-[0.72rem]"
                                        animate={{ y: [0, -3, 0], boxShadow: ['0 8px 20px rgba(56,189,248,0.08)', '0 14px 26px rgba(56,189,248,0.14)', '0 8px 20px rgba(56,189,248,0.08)'] }}
                                        transition={{ ...floatingLoop, duration: 5.4 }}
                                    >
                                        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                                        WarrantyPro Workspace
                                    </motion.div>
                                    <h1 className="mt-4 max-w-4xl text-[2.05rem] font-semibold tracking-[-0.06em] text-[#111111] sm:mt-6 sm:text-5xl lg:text-6xl">
                                        Save, track, and claim every warranty from one premium dashboard.
                                    </h1>
                                    <HeadingAccent />
                                    <p className="mt-4 max-w-3xl text-[0.95rem] leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
                                        WarrantyPro turns receipts, coverage dates, and product records into a calm operating layer, so every claim starts organized instead of rushed.
                                    </p>

                                    <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                                        <Link
                                            to="/warranties/new?mode=scan"
                                            className="micro-lift inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:min-h-0 sm:w-auto"
                                        >
                                            <ScanSearch className="h-4 w-4" strokeWidth={2} />
                                            Scan Receipt with AI
                                        </Link>
                                        <Link
                                            to="/warranties/new?mode=manual"
                                            className="micro-lift inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-colors hover:bg-slate-50 sm:min-h-0 sm:w-auto"
                                        >
                                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-400 text-slate-900">
                                                <CirclePlus className="h-3.5 w-3.5" strokeWidth={2.2} />
                                            </span>
                                            Add Warranty
                                        </Link>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5">
                                        {heroTrustBadges.map(({ label, icon: Icon }, index) => (
                                            <motion.span
                                                key={label}
                                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-slate-600 sm:px-3 sm:py-2 sm:text-[0.7rem]"
                                                animate={{ y: [0, -2, 0], scale: [1, 1.01, 1] }}
                                                transition={{ ...floatingLoop, duration: 4.4 + index * 0.35, delay: index * 0.18 }}
                                            >
                                                <Icon className="h-3.5 w-3.5 text-sky-600" strokeWidth={2} />
                                                {label}
                                            </motion.span>
                                        ))}
                                    </div>

                                    <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
                                        <motion.div
                                            className="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:px-5"
                                            animate={{ y: [0, -4, 0] }}
                                            transition={{ ...floatingLoop, duration: 5.8, delay: 0.1 }}
                                        >
                                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-400">Protected Value</p>
                                            <div className="mt-2 text-[1.8rem] font-semibold tracking-[-0.05em] text-[#111111] sm:text-[2rem]">
                                                {formatCurrency(totalValue)}
                                            </div>
                                        </motion.div>
                                        <motion.div
                                            className="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:px-5"
                                            animate={{ y: [0, -4, 0] }}
                                            transition={{ ...floatingLoop, duration: 6.1, delay: 0.28 }}
                                        >
                                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-400">Live Records</p>
                                            <div className="mt-2 text-[1.8rem] font-semibold tracking-[-0.05em] text-[#111111] sm:text-[2rem]">
                                                {warranties.length}
                                            </div>
                                        </motion.div>
                                        <motion.div
                                            className="col-span-2 rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:col-span-1 sm:px-5"
                                            animate={{ y: [0, -4, 0] }}
                                            transition={{ ...floatingLoop, duration: 5.5, delay: 0.44 }}
                                        >
                                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-400">Review Soon</p>
                                            <div className="mt-2 text-[1.8rem] font-semibold tracking-[-0.05em] text-[#111111] sm:text-[2rem]">
                                                {expiringSoonCount}
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>

                                <motion.div
                                    className="micro-lift rounded-[1.6rem] border border-slate-200 bg-white/92 p-4 shadow-[0_18px_38px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:rounded-[1.8rem] sm:p-6"
                                    animate={{ y: [0, -5, 0], boxShadow: ['0 18px 38px rgba(15,23,42,0.06)', '0 24px 46px rgba(15,23,42,0.10)', '0 18px 38px rgba(15,23,42,0.06)'] }}
                                    transition={{ ...floatingLoop, duration: 6.2 }}
                                >
                                    <div className="flex items-start gap-3 text-slate-700">
                                        <motion.div
                                            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700"
                                            animate={{ scale: [1, 1.08, 1], rotate: [0, -6, 0] }}
                                            transition={{ ...floatingLoop, duration: 4.2 }}
                                        >
                                            <ScanSearch className="h-4.5 w-4.5" strokeWidth={2} />
                                        </motion.div>
                                        <div>
                                            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Smart Intake</p>
                                            <p className="mt-1 text-lg font-semibold text-slate-900">Choose the cleanest way to save a warranty.</p>
                                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                                Use AI when speed matters, or switch to manual entry when you need tighter control over dates, notes, and product detail.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-3">
                                        <Link
                                            to="/warranties/new?mode=scan"
                                            className="micro-lift flex items-center justify-between rounded-[1.25rem] border border-sky-100 bg-sky-50/70 px-4 py-4 transition-colors hover:bg-sky-50"
                                        >
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Fastest path</p>
                                                <p className="mt-1 text-sm font-medium leading-6 text-slate-700">Scan the receipt, review the fields, and save in one flow.</p>
                                            </div>
                                            <motion.div
                                                animate={{ x: [0, 4, 0] }}
                                                transition={{ ...floatingLoop, duration: 2.4 }}
                                            >
                                                <ArrowRight className="h-4 w-4 flex-shrink-0 text-sky-700" />
                                            </motion.div>
                                        </Link>
                                        <Link
                                            to="/warranties/new?mode=manual"
                                            className="micro-lift flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-[#f8fafc] px-4 py-4 transition-colors hover:bg-slate-50"
                                        >
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Most controlled</p>
                                                <p className="mt-1 text-sm font-medium leading-6 text-slate-700">Add exact product history yourself when coverage terms need extra care.</p>
                                            </div>
                                            <motion.div
                                                animate={{ x: [0, 4, 0] }}
                                                transition={{ ...floatingLoop, duration: 2.7, delay: 0.15 }}
                                            >
                                                <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-500" />
                                            </motion.div>
                                        </Link>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        <div className="mt-10 rounded-[1.8rem] border border-slate-200 bg-[#fbfdff] p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:mt-12 sm:p-6">
                            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-400">Getting Started</p>
                                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">A safer way to onboard into the product.</h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                                        Follow these three guided moves to bring the workspace online without digging through menus.
                                    </p>
                                </div>

                                <div className="rounded-[1.25rem] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Readiness</p>
                                    <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-950">{onboardingProgress}/3</div>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4 lg:grid-cols-3">
                                {onboardingSteps.map((step) => {
                                    const Icon = step.icon;
                                    const toneClasses = step.tone === 'sky'
                                        ? 'border-sky-200 bg-sky-50 text-sky-700'
                                        : step.tone === 'amber'
                                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                                            : 'border-emerald-200 bg-emerald-50 text-emerald-700';

                                    return (
                                        <button
                                            key={step.title}
                                            type="button"
                                            onClick={step.onClick}
                                            className="group micro-lift relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-5 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
                                        >
                                            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.06),transparent_36%)]" />
                                            </div>
                                            <div className={`inline-flex rounded-2xl border p-3 ${toneClasses}`}>
                                                <Icon className="h-5 w-5" strokeWidth={2} />
                                            </div>
                                            <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">{step.eyebrow}</p>
                                            <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950">{step.title}</h3>
                                            <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
                                            <div className="mt-5 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                {step.actionLabel}
                                                <ArrowRight className="h-4 w-4" strokeWidth={2} />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-12 sm:mt-14">
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
                                        <button
                                            key={tile.title}
                                            type="button"
                                            onClick={() => handleFeatureAction(tile.action)}
                                            className="group micro-lift relative overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white p-5 text-left shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-all duration-300 hover:border-slate-300"
                                        >
                                            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.06),transparent_34%)]" />
                                            </div>
                                            <div className={`inline-flex rounded-2xl border p-3 ${toneClasses}`}>
                                                <Icon className="h-5 w-5" strokeWidth={2} />
                                            </div>
                                            <div className="mt-5 flex items-start justify-between gap-4">
                                                <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">{tile.title}</h3>
                                                <ArrowRight className="mt-1 h-4.5 w-4.5 shrink-0 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-slate-700" strokeWidth={2} />
                                            </div>
                                            <p className="mt-3 text-sm leading-7 text-slate-600">{tile.description}</p>
                                            <div className="mt-5 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
                                                {tile.hint}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-12 sm:mt-14">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#111111]">How It Works</h2>
                                <HeadingAccent />
                            </div>
                            <div className="mt-8 grid gap-4 lg:grid-cols-3">
                                {workflowSteps.map((step, index) => (
                                    <motion.div
                                        key={step.title}
                                        className="rounded-[1.6rem] border border-slate-200 bg-[#fbfdff] p-6 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-all duration-[850ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
                                        initial={{ opacity: 0, y: 26 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.2 }}
                                        transition={{
                                            duration: 0.8,
                                            delay: 0.16 + index * 0.18,
                                            ease: [0.22, 1, 0.36, 1],
                                        }}
                                    >
                                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                                            {index + 1}
                                        </div>
                                        <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em] text-slate-950">{step.title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-10 sm:mt-12">
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

                <section ref={warrantiesSectionRef} className="w-full scroll-mt-24 px-4 pt-14 sm:px-8 sm:pt-16 lg:px-16">
                    <div className="rounded-[1.75rem] bg-white px-4 py-8 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:rounded-[2rem] sm:px-8 sm:py-10 lg:px-10">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#111111]">Warranties</h2>
                                <HeadingAccent />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_220px] lg:w-[540px]">
                                <label className="relative">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                                    <input
                                        type="text"
                                        value={portfolioSearch}
                                        onChange={(event) => setPortfolioSearch(event.target.value)}
                                        placeholder="Search product, brand, or category"
                                        className="neu-input w-full pl-11"
                                    />
                                </label>
                                <label className="relative">
                                    <ArrowUpDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                                    <select
                                        value={portfolioSort}
                                        onChange={(event) => setPortfolioSort(event.target.value as 'priority' | 'value' | 'recent' | 'expiry')}
                                        className="neu-input w-full appearance-none pl-11"
                                    >
                                        <option value="priority">Sort: Dashboard Priority</option>
                                        <option value="value">Sort: Highest Value</option>
                                        <option value="recent">Sort: Most Recent</option>
                                        <option value="expiry">Sort: Expiry Soonest</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-slate-500">
                            Showing <span className="font-semibold text-slate-900">{preparedWarranties.length}</span> record{preparedWarranties.length === 1 ? "" : "s"} for your current portfolio view.
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                            {[
                                { key: 'all', label: `All Records (${warranties.length})` },
                                { key: 'expiring', label: `Expiring Soon (${expiringSoonCount})` },
                                { key: 'highValue', label: `High Value (${highValueCount})` },
                                { key: 'recent', label: `Recently Added (${recentCount})` },
                            ].map((entry) => (
                                <button
                                    key={entry.key}
                                    onClick={() => setPortfolioView(entry.key as 'all' | 'expiring' | 'highValue' | 'recent')}
                                    className={`micro-lift rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                                        portfolioView === entry.key
                                            ? 'border-slate-950 bg-slate-950 text-white'
                                            : 'border-slate-200 bg-white text-slate-600 hover:text-slate-950'
                                    }`}
                                >
                                    {entry.label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {[
                                { key: 'balanced', label: 'Saved View: Balanced' },
                                { key: 'renewals', label: 'Saved View: Renewals' },
                                { key: 'highValue', label: 'Saved View: High Value' },
                                { key: 'fresh', label: 'Saved View: Fresh Receipts' },
                            ].map((entry) => (
                                <button
                                    key={entry.key}
                                    onClick={() => applySavedPortfolioView(entry.key as 'balanced' | 'renewals' | 'highValue' | 'fresh')}
                                    className={`micro-lift rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                                        savedPortfolioView === entry.key
                                            ? 'border-sky-200 bg-sky-50 text-sky-700'
                                            : 'border-slate-200 bg-white text-slate-500 hover:text-slate-950'
                                    }`}
                                >
                                    {entry.label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-5 grid gap-4 lg:grid-cols-3">
                            <div className="rounded-[1.35rem] border border-slate-200 bg-[#fbfdff] px-5 py-4">
                                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Portfolio Focus</p>
                                <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950">
                                    {portfolioView === 'all'
                                        ? 'Balanced workspace view'
                                        : portfolioView === 'expiring'
                                            ? 'Expiry-first review mode'
                                            : portfolioView === 'highValue'
                                                ? 'Highest value products'
                                                : 'Freshest additions first'}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {portfolioView === 'all'
                                        ? 'See the full portfolio with search, category filters, and your preferred sorting rule.'
                                        : portfolioView === 'expiring'
                                            ? 'Bring the products with the closest renewal windows to the top of your review queue.'
                                            : portfolioView === 'highValue'
                                                ? 'Keep the most valuable items in easier reach when coverage matters more.'
                                                : 'Review the newest purchases while details and receipts are still easy to confirm.'}
                                </p>
                            </div>
                            <div className="rounded-[1.35rem] border border-slate-200 bg-white px-5 py-4">
                                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Current Search</p>
                                <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950">
                                    {portfolioSearch.trim() ? `"${portfolioSearch.trim()}"` : 'No active search'}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Narrow the workspace by product, brand, or category without losing the bigger picture.
                                </p>
                            </div>
                            <div className="rounded-[1.35rem] border border-slate-200 bg-white px-5 py-4">
                                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Sort Rule</p>
                                <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950">
                                    {portfolioSort === 'priority'
                                        ? 'Dashboard priority'
                                        : portfolioSort === 'value'
                                            ? 'Highest value first'
                                            : portfolioSort === 'recent'
                                                ? 'Most recent first'
                                                : 'Expiry soonest first'}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Switch the queue to match the way you want to review warranties today.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:gap-6">
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
                                    <WarrantyCard
                                        warranty={warranty}
                                        display={display}
                                        onDelete={openDeleteWarranty}
                                        deleting={deletingWarrantyId === (warranty._id || warranty.id)}
                                    />
                                </div>
                            ))}
                        </div>

                        {preparedWarranties.length === 0 && (
                            <div className="mt-8 rounded-[1.8rem] bg-slate-50 px-6 py-14 text-center">
                                <div className="empty-orb mb-5">
                                    <Boxes className="h-7 w-7 text-slate-400" strokeWidth={2} />
                                </div>
                                <div className="page-shimmer-line mx-auto mb-5 h-[3px] w-24" />
                                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-slate-400">No visible records</p>
                                <p className="mt-4 text-3xl font-semibold text-[#111111]">No warranties match this view.</p>
                                <p className="mt-3 text-sm text-slate-600">
                                    {portfolioSearch.trim()
                                        ? 'Try a broader search term or switch to another quick view to bring matching products back into the workspace.'
                                        : 'Choose another category, adjust the quick view, or add a new warranty to the portfolio.'}
                                </p>
                                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                                    <ShieldCheck className="h-3.5 w-3.5 text-sky-600" strokeWidth={2} />
                                    Portfolio will refill here
                                </div>
                                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                    <Link
                                        to="/warranties/new?mode=scan"
                                        className="micro-lift inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                                    >
                                        <ScanSearch className="h-4 w-4" strokeWidth={2} />
                                        Scan Receipt with AI
                                    </Link>
                                    <Link
                                        to="/warranties/new?mode=manual"
                                        className="micro-lift inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
                                    >
                                        <SquarePen className="h-4 w-4" strokeWidth={2} />
                                        Add Warranty Manually
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="w-full px-4 pt-14 sm:px-8 sm:pt-16 lg:px-16">
                    <div className="rounded-[1.75rem] bg-white px-4 py-8 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:rounded-[2rem] sm:px-8 sm:py-10 lg:px-10">
                        <div className="grid gap-4 lg:grid-cols-3">
                            {trustSignals.map((signal, index) => (
                                <motion.div
                                    key={signal.label}
                                    className="micro-lift rounded-[1.6rem] border border-slate-200 bg-[#fbfdff] p-6"
                                    initial={{ opacity: 0, y: 18 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <div className="inline-flex rounded-2xl border border-sky-200 bg-sky-50 p-3 text-sky-700">
                                        <ShieldCheck className="h-5 w-5" strokeWidth={2} />
                                    </div>
                                    <p className="mt-5 text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-slate-400">{signal.label}</p>
                                    <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950">{signal.value}</h3>
                                    <p className="mt-3 text-sm leading-7 text-slate-600">{signal.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="w-full px-4 pt-14 sm:px-8 sm:pt-16 lg:px-16">
                    <div className="rounded-[1.75rem] bg-white px-4 py-8 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:rounded-[2rem] sm:px-8 sm:py-10 lg:px-10">
                        <div className="max-w-3xl">
                            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#111111]">Pricing</h2>
                            <HeadingAccent />
                            <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
                                Choose a workflow that fits the way you manage receipts, renewal alerts, and support claims. Keep it simple, or step into a more automated setup.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                {pricingTrustBadges.map((badge) => {
                                    const Icon = badge.icon;

                                    return (
                                        <div key={badge.label} className="trust-chip">
                                            <Icon className="h-3.5 w-3.5 text-sky-600" strokeWidth={2} />
                                            <span>{badge.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-8 grid gap-5 xl:grid-cols-3">
                            {pricingTiers.map((tier, index) => (
                                <motion.div
                                    key={tier.name}
                                    className={`micro-lift rounded-[1.8rem] border p-6 ${
                                        tier.featured
                                            ? 'border-sky-300 bg-[linear-gradient(180deg,#ffffff_0%,#f4fbff_100%)] shadow-[0_18px_40px_rgba(56,189,248,0.12)]'
                                            : 'border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.04)]'
                                    }`}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.75, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-400">{tier.name}</p>
                                            <div className="mt-4 flex items-end gap-2">
                                                <span className="text-4xl font-semibold tracking-[-0.06em] text-slate-950">{tier.price}</span>
                                                <span className="pb-1 text-sm text-slate-500">{tier.cadence}</span>
                                            </div>
                                        </div>
                                        {tier.featured && (
                                            <span className="rounded-full bg-slate-950 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white">
                                                Most Used
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-5 text-sm leading-7 text-slate-600">{tier.description}</p>

                                    <div className="mt-6 space-y-3">
                                        {tier.features.map((feature) => (
                                            <div key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                                                <span className="mt-0.5 inline-flex rounded-full bg-sky-50 p-1 text-sky-700">
                                                    <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                                                </span>
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        to={tier.ctaTo}
                                        className={`micro-lift mt-7 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
                                            tier.featured
                                                ? 'bg-slate-950 text-white hover:bg-slate-800'
                                                : 'bg-[#f8fafc] text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        {tier.ctaLabel}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="w-full px-4 pt-14 sm:px-8 sm:pt-16 lg:px-16">
                    <div className="rounded-[1.75rem] bg-white px-4 py-8 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:rounded-[2rem] sm:px-8 sm:py-10 lg:px-10">
                        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                            <div className="max-w-2xl">
                                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#111111]">FAQ</h2>
                                <HeadingAccent />
                                <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
                                    A few quick answers around scanning, reminders, portfolio visibility, and claim readiness so the product feels straightforward from the first click.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {faqItems.map((item, index) => {
                                    const isOpen = activeFaq === index;

                                    return (
                                        <div key={item.question} className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white">
                                            <button
                                                type="button"
                                                onClick={() => setActiveFaq(isOpen ? -1 : index)}
                                                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                                            >
                                                <span className="text-base font-semibold tracking-[-0.02em] text-slate-950">{item.question}</span>
                                                <ChevronDown
                                                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                                    strokeWidth={2}
                                                />
                                            </button>
                                            <AnimatePresence initial={false}>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="border-t border-slate-100 px-5 py-4 text-sm leading-7 text-slate-600">
                                                            {item.answer}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="w-full px-4 pb-10 pt-14 sm:px-8 sm:pb-12 sm:pt-16 lg:px-16">
                <div className="rounded-[1.75rem] bg-white px-4 py-8 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:rounded-[2rem] sm:px-8">
                        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end">
                            <div>
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-slate-950 p-2.5 text-white">
                                    <WarrantyProMark className="h-8 w-8" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-950">Warranty Pro</div>
                                    <div className="text-sm text-slate-600">Save proof. Track expiry. Stay claim-ready.</div>
                                </div>
                            </div>

                            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">
                                A cleaner way to manage warranties across purchases, reminders, and support events without scattered receipts or rushed paperwork.
                            </p>
                        </div>

                        <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                            <Link to="/" className="transition-colors hover:text-slate-950">Dashboard</Link>
                            <Link to="/warranties/new?mode=scan" className="transition-colors hover:text-slate-950">AI Receipt Scan</Link>
                            <Link to="/claims" className="transition-colors hover:text-slate-950">Claims</Link>
                            <Link to="/notifications" className="transition-colors hover:text-slate-950">Notifications</Link>
                            <Link to="/service-centers" className="transition-colors hover:text-slate-950">Service Centers</Link>
                            <Link to="/configuration" className="transition-colors hover:text-slate-950">Settings</Link>
                        </div>
                    </div>
                </div>
            </footer>

            <AnimatePresence>
                {activeFeatureModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.14),rgba(15,23,42,0.12)_42%,rgba(15,23,42,0.18)_100%)] px-4 py-8 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeFeatureModal}
                    >
                        <motion.div
                            className="modal-luxury-shell relative z-10 w-full max-w-2xl p-6 sm:p-8"
                            initial={{ opacity: 0, y: 18, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 14, scale: 0.985 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent" />
                            <div className="relative z-10 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-400">
                                        {activeFeatureModal === 'intake' ? 'Choose Intake Mode' : 'Expiring Soon'}
                                    </p>
                                    <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                                        {activeFeatureModal === 'intake'
                                            ? 'Bring a new warranty into the system.'
                                            : 'See which warranties need attention next.'}
                                    </h3>
                                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                                        {activeFeatureModal === 'intake'
                                            ? 'Start with AI receipt scanning for speed or open the manual flow when you want full control over every detail.'
                                            : 'These products are nearing expiry within the next 45 days, so you can review coverage before it becomes urgent.'}
                                    </p>
                                    <div className="page-shimmer-line mt-5 h-[3px] w-24" />
                                </div>
                                <button
                                    type="button"
                                    onClick={closeFeatureModal}
                                    className="rounded-full border border-slate-200 p-2 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900"
                                    aria-label="Close"
                                >
                                    <X className="h-4 w-4" strokeWidth={2} />
                                </button>
                            </div>

                            {activeFeatureModal === 'intake' ? (
                                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => handleIntakeChoice('scan')}
                                        className="rounded-[1.6rem] bg-slate-950 px-5 py-5 text-left text-white transition-transform duration-300 hover:-translate-y-1"
                                    >
                                        <div className="inline-flex rounded-2xl bg-white/10 p-3">
                                            <ScanSearch className="h-5 w-5" strokeWidth={2} />
                                        </div>
                                        <div className="mt-5 text-lg font-semibold tracking-[-0.03em]">AI Scan</div>
                                        <p className="mt-3 text-sm leading-7 text-slate-300">
                                            Upload a receipt and let the scanner prefill product, brand, price, and dates.
                                        </p>
                                        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-200">
                                            Fastest path
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleIntakeChoice('manual')}
                                        className="rounded-[1.6rem] border border-slate-200 bg-[#f8fafc] px-5 py-5 text-left text-slate-950 transition-transform duration-300 hover:-translate-y-1 hover:border-slate-300"
                                    >
                                        <div className="inline-flex rounded-2xl bg-white p-3 text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                                            <SquarePen className="h-5 w-5" strokeWidth={2} />
                                        </div>
                                        <div className="mt-5 text-lg font-semibold tracking-[-0.03em]">Add Manually</div>
                                        <p className="mt-3 text-sm leading-7 text-slate-600">
                                            Create a record yourself when you want exact control over notes, dates, or coverage terms.
                                        </p>
                                        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            Full control
                                        </div>
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-8 space-y-3">
                                    {expiringSoonItems.length > 0 ? (
                                        expiringSoonItems.map((item) => (
                                            <button
                                                key={item.warranty._id || item.warranty.id}
                                                type="button"
                                                onClick={() => handleExpiryItemClick(item.warranty._id || item.warranty.id)}
                                                className="flex w-full items-center justify-between gap-4 rounded-[1.4rem] border border-slate-200 bg-[#fbfdff] px-5 py-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
                                            >
                                                <div>
                                                    <div className="text-base font-semibold text-slate-950">
                                                        {item.warranty.product_name || item.warranty.brand || 'Untitled warranty'}
                                                    </div>
                                                    <div className="mt-2 text-sm text-slate-600">
                                                        Expires {formatDateLabel(item.expiryDate.toISOString())}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-semibold text-slate-950">
                                                        {item.daysLeft === 0 ? 'Today' : `${item.daysLeft} days`}
                                                    </div>
                                                    <div className="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-amber-600">
                                                        Review now
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="rounded-[1.6rem] bg-[#f8fafc] px-6 py-10 text-center">
                                            <div className="empty-orb mb-5">
                                                <BellRing className="h-7 w-7 text-slate-400" strokeWidth={2} />
                                            </div>
                                            <div className="page-shimmer-line mx-auto mb-5 h-[3px] w-24" />
                                            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-400">
                                                All clear
                                            </div>
                                            <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                                                No warranties are expiring soon.
                                            </div>
                                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                                Your next renewal alerts will show up here automatically as coverage windows get closer.
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveFeatureModal(null);
                                                navigate('/notifications');
                                            }}
                                            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                                        >
                                            Open Notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <DeleteWarrantyModal
                open={Boolean(pendingDeleteWarranty)}
                itemLabel={pendingDeleteWarranty?.product_name || pendingDeleteWarranty?.brand || 'this warranty'}
                loading={Boolean(deletingWarrantyId)}
                error={deleteError}
                onClose={closeDeleteWarranty}
                onConfirm={handleDeleteWarranty}
            />
        </div>
    );
};

