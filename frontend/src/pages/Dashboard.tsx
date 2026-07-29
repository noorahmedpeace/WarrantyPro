import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowUpDown, BadgeCheck, BellRing, Boxes, Check, ChevronDown, CirclePlus, Cloud, LockKeyhole, LogOut, ScanLine, ScanSearch, Search, ShieldCheck, Sparkles, SquarePen, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { warrantiesApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { CategoryFilter } from '../components/CategoryFilter';
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
    <span className="mt-4 block h-[3px] w-16 rounded-full bg-accent" />
);


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
            <div className="flex min-h-screen w-screen items-center justify-center bg-surface px-6">
                <div className="rounded-surface bg-surface-raised px-8 py-7 shadow-raised">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                        <div>
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-neutral">Warranty Pro</p>
                            <p className="mt-1 text-sm text-ink-muted">Loading dashboard...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-screen bg-surface text-ink">
            <header className="sticky top-0 z-30 px-4 pt-4 sm:px-8 sm:pt-5 lg:px-16">
                <div className="page-section mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 rounded-surface px-4 py-3 sm:px-5 sm:py-4">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <motion.div
                            className="rounded-surface bg-accent p-2.5 text-on-accent shadow-raised"
                        >
                            <WarrantyProMark className="h-9 w-9" />
                        </motion.div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <div className="truncate text-sm font-semibold uppercase tracking-[0.24em] text-ink">Warranty Pro</div>
                                <motion.span
                                    className="hidden rounded-full border border-accent bg-accent-wash px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-accent sm:inline-flex"
                                >
                                    Protected Workspace
                                </motion.span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral">
                                <span>Clean protection dashboard</span>
                                <span className="hidden h-1 w-1 rounded-full bg-surface-raised sm:inline-block" />
                                <span className="hidden sm:inline">Claims, reminders, and proof in one place</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="hidden items-center gap-1.5 rounded-full border border-rule bg-surface px-2 py-1.5 sm:flex">
                            <Link to="/claims" className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink">Claims</Link>
                            <Link to="/service-centers" className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink">Centers</Link>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-rule bg-surface-raised px-2.5 py-2 shadow-raised">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-on-accent">
                                {initial}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="rounded-full bg-surface p-2 text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
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
                    <div className="overflow-hidden rounded-surface bg-surface px-4 py-6 shadow-raised sm:rounded-surface sm:px-8 sm:py-10 lg:px-10">
                        <div className="relative overflow-hidden rounded-surface bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-1 py-1 sm:rounded-surface">
                            <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.88fr)] lg:gap-10 lg:items-start">
                                <div className="max-w-4xl px-1 py-1 sm:px-2 sm:py-2">
                                    <motion.div
                                        className="inline-flex items-center gap-2 rounded-full border border-accent bg-surface px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-accent shadow-raised sm:px-4 sm:text-[0.72rem]"
                                    >
                                        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                                        WarrantyPro Workspace
                                    </motion.div>
                                    <h1 className="mt-4 max-w-4xl text-[2.05rem] font-semibold tracking-[-0.06em] text-ink sm:mt-6 sm:text-5xl lg:text-6xl">
                                        Save, track, and claim every warranty from one premium dashboard.
                                    </h1>
                                    <HeadingAccent />
                                    <p className="mt-4 max-w-3xl text-[0.95rem] leading-7 text-ink-muted sm:mt-6 sm:text-lg sm:leading-8">
                                        WarrantyPro turns receipts, coverage dates, and product records into a calm operating layer, so every claim starts organized instead of rushed.
                                    </p>

                                    <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                                        <Link
                                            to="/warranties/new?mode=scan"
                                            className="row-interactive inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-center text-sm font-semibold text-on-accent transition-colors hover:bg-accent-pressed sm:min-h-0 sm:w-auto"
                                        >
                                            <ScanSearch className="h-4 w-4" strokeWidth={2} />
                                            Scan Receipt with AI
                                        </Link>
                                        <Link
                                            to="/warranties/new?mode=manual"
                                            className="row-interactive inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-rule bg-surface px-5 py-3 text-center text-sm font-semibold text-ink shadow-raised transition-colors hover:bg-surface-raised sm:min-h-0 sm:w-auto"
                                        >
                                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-rule text-ink">
                                                <CirclePlus className="h-3.5 w-3.5" strokeWidth={2.2} />
                                            </span>
                                            Add Warranty
                                        </Link>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5">
                                        {heroTrustBadges.map(({ label, icon: Icon }) => (
                                            <motion.span
                                                key={label}
                                                className="inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-3 py-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-ink-muted sm:px-3 sm:py-2 sm:text-[0.7rem]"
                                            >
                                                <Icon className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
                                                {label}
                                            </motion.span>
                                        ))}
                                    </div>

                                    <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
                                        <motion.div
                                            className="rounded-surface border border-rule bg-surface px-4 py-4 shadow-raised sm:px-5"
                                        >
                                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-neutral">Protected Value</p>
                                            <div className="mt-2 text-[1.8rem] font-semibold tracking-[-0.05em] text-ink sm:text-[2rem]">
                                                {formatCurrency(totalValue)}
                                            </div>
                                        </motion.div>
                                        <motion.div
                                            className="rounded-surface border border-rule bg-surface px-4 py-4 shadow-raised sm:px-5"
                                        >
                                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-neutral">Live Records</p>
                                            <div className="mt-2 text-[1.8rem] font-semibold tracking-[-0.05em] text-ink sm:text-[2rem]">
                                                {warranties.length}
                                            </div>
                                        </motion.div>
                                        <motion.div
                                            className="col-span-2 rounded-surface border border-rule bg-surface px-4 py-4 shadow-raised sm:col-span-1 sm:px-5"
                                        >
                                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-neutral">Review Soon</p>
                                            <div className="mt-2 text-[1.8rem] font-semibold tracking-[-0.05em] text-ink sm:text-[2rem]">
                                                {expiringSoonCount}
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>

                                <motion.div
                                    className="row-interactive rounded-surface border border-rule bg-surface p-4 shadow-raised backdrop-blur-sm sm:rounded-surface sm:p-6"
                                >
                                    <div className="flex items-start gap-3 text-ink-muted">
                                        <motion.div
                                            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-wash text-accent"
                                        >
                                            <ScanSearch className="h-4.5 w-4.5" strokeWidth={2} />
                                        </motion.div>
                                        <div>
                                            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-neutral">Smart Intake</p>
                                            <p className="mt-1 text-lg font-semibold text-ink">Choose the cleanest way to save a warranty.</p>
                                            <p className="mt-3 text-sm leading-6 text-neutral">
                                                Use AI when speed matters, or switch to manual entry when you need tighter control over dates, notes, and product detail.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-3">
                                        <Link
                                            to="/warranties/new?mode=scan"
                                            className="row-interactive flex items-center justify-between rounded-surface border border-accent bg-accent-wash/70 px-4 py-4 transition-colors hover:bg-accent-wash"
                                        >
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Fastest path</p>
                                                <p className="mt-1 text-sm font-medium leading-6 text-ink-muted">Scan the receipt, review the fields, and save in one flow.</p>
                                            </div>
                                            <motion.div
                                            >
                                                <ArrowRight className="h-4 w-4 flex-shrink-0 text-accent" />
                                            </motion.div>
                                        </Link>
                                        <Link
                                            to="/warranties/new?mode=manual"
                                            className="row-interactive flex items-center justify-between rounded-surface border border-rule bg-surface-raised px-4 py-4 transition-colors hover:bg-surface-raised"
                                        >
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral">Most controlled</p>
                                                <p className="mt-1 text-sm font-medium leading-6 text-ink-muted">Add exact product history yourself when coverage terms need extra care.</p>
                                            </div>
                                            <motion.div
                                            >
                                                <ArrowRight className="h-4 w-4 flex-shrink-0 text-neutral" />
                                            </motion.div>
                                        </Link>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        <div className="mt-10 rounded-surface border border-rule bg-surface-raised p-5 shadow-raised sm:mt-12 sm:p-6">
                            <div className="flex flex-col gap-4 border-b border-rule pb-5 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-neutral">Getting Started</p>
                                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">A safer way to onboard into the product.</h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-muted">
                                        Follow these three guided moves to bring the workspace online without digging through menus.
                                    </p>
                                </div>

                                <div className="rounded-surface bg-surface px-4 py-3 shadow-raised">
                                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-neutral">Readiness</p>
                                    <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ink">{onboardingProgress}/3</div>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4 lg:grid-cols-3">
                                {onboardingSteps.map((step) => {
                                    const Icon = step.icon;
                                    const toneClasses = step.tone === 'sky'
                                        ? 'border-accent bg-accent-wash text-accent'
                                        : step.tone === 'amber'
                                            ? 'border-expiring bg-expiring-wash text-expiring'
                                            : 'border-covered bg-covered-wash text-covered';

                                    return (
                                        <button
                                            key={step.title}
                                            type="button"
                                            onClick={step.onClick}
                                            className="group row-interactive relative overflow-hidden rounded-surface border border-rule bg-surface p-5 text-left transition-colors hover:border-rule hover:bg-surface-raised"
                                        >
                                            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.06),transparent_36%)]" />
                                            </div>
                                            <div className={`inline-flex rounded-surface border p-3 ${toneClasses}`}>
                                                <Icon className="h-5 w-5" strokeWidth={2} />
                                            </div>
                                            <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-neutral">{step.eyebrow}</p>
                                            <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-ink">{step.title}</h3>
                                            <p className="mt-3 text-sm leading-7 text-ink-muted">{step.description}</p>
                                            <div className="mt-5 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-neutral">
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
                                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-ink">Core Features</h2>
                                <HeadingAccent />
                            </div>
                            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {featureTiles.map((tile) => {
                                    const Icon = tile.icon;
                                    const toneClasses = tile.tone === 'sky'
                                        ? 'border-accent bg-accent-wash text-accent'
                                        : tile.tone === 'amber'
                                            ? 'border-expiring bg-expiring-wash text-expiring'
                                            : tile.tone === 'emerald'
                                                ? 'border-covered bg-covered-wash text-covered'
                                                : 'border-rule bg-surface-raised text-ink-muted';

                                    return (
                                        <button
                                            key={tile.title}
                                            type="button"
                                            onClick={() => handleFeatureAction(tile.action)}
                                            className="group row-interactive relative overflow-hidden rounded-surface border border-rule bg-surface p-5 text-left shadow-raised transition-all duration-300 hover:border-rule"
                                        >
                                            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.06),transparent_34%)]" />
                                            </div>
                                            <div className={`inline-flex rounded-surface border p-3 ${toneClasses}`}>
                                                <Icon className="h-5 w-5" strokeWidth={2} />
                                            </div>
                                            <div className="mt-5 flex items-start justify-between gap-4">
                                                <h3 className="text-lg font-semibold tracking-[-0.03em] text-ink">{tile.title}</h3>
                                                <ArrowRight className="mt-1 h-4.5 w-4.5 shrink-0 text-neutral transition-transform duration-300 group-hover:translate-x-1 group-hover:text-ink-muted" strokeWidth={2} />
                                            </div>
                                            <p className="mt-3 text-sm leading-7 text-ink-muted">{tile.description}</p>
                                            <div className="mt-5 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-neutral">
                                                {tile.hint}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-12 sm:mt-14">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-ink">How It Works</h2>
                                <HeadingAccent />
                            </div>
                            <div className="mt-8 grid gap-4 lg:grid-cols-3">
                                {workflowSteps.map((step, index) => (
                                    <motion.div
                                        key={step.title}
                                        className="rounded-surface border border-rule bg-surface-raised p-6 shadow-raised transition-all duration-[850ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
                                        initial={{ opacity: 0, y: 26 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.2 }}
                                        transition={{
                                            duration: 0.8,
                                            delay: 0.16 + index * 0.18,
                                            ease: [0.22, 1, 0.36, 1],
                                        }}
                                    >
                                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-on-accent">
                                            {index + 1}
                                        </div>
                                        <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em] text-ink">{step.title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-ink-muted">{step.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-10 sm:mt-12">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-ink">Portfolio Filters</h2>
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
                    </div>
                </section>

                <section ref={warrantiesSectionRef} className="w-full scroll-mt-24 px-4 pt-14 sm:px-8 sm:pt-16 lg:px-16">
                    <div className="rounded-surface bg-surface px-4 py-8 shadow-raised sm:rounded-surface sm:px-8 sm:py-10 lg:px-10">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-ink">Warranties</h2>
                                <HeadingAccent />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_220px] lg:w-[540px]">
                                <label className="relative">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral" strokeWidth={2} />
                                    <input
                                        type="text"
                                        value={portfolioSearch}
                                        onChange={(event) => setPortfolioSearch(event.target.value)}
                                        placeholder="Search product, brand, or category"
                                        className="field-input w-full pl-11"
                                    />
                                </label>
                                <label className="relative">
                                    <ArrowUpDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral" strokeWidth={2} />
                                    <select
                                        value={portfolioSort}
                                        onChange={(event) => setPortfolioSort(event.target.value as 'priority' | 'value' | 'recent' | 'expiry')}
                                        className="field-input w-full appearance-none pl-11"
                                    >
                                        <option value="priority">Sort: Dashboard Priority</option>
                                        <option value="value">Sort: Highest Value</option>
                                        <option value="recent">Sort: Most Recent</option>
                                        <option value="expiry">Sort: Expiry Soonest</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-neutral">
                            Showing <span className="font-semibold text-ink">{preparedWarranties.length}</span> record{preparedWarranties.length === 1 ? "" : "s"} for your current portfolio view.
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
                                    className={`row-interactive rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                                        portfolioView === entry.key
                                            ? 'border-accent bg-accent text-on-accent'
                                            : 'border-rule bg-surface text-ink-muted hover:text-ink'
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
                                    className={`row-interactive rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                                        savedPortfolioView === entry.key
                                            ? 'border-accent bg-accent-wash text-accent'
                                            : 'border-rule bg-surface text-neutral hover:text-ink'
                                    }`}
                                >
                                    {entry.label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-5 grid gap-4 lg:grid-cols-3">
                            <div className="rounded-surface border border-rule bg-surface-raised px-5 py-4">
                                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-neutral">Portfolio Focus</p>
                                <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-ink">
                                    {portfolioView === 'all'
                                        ? 'Balanced workspace view'
                                        : portfolioView === 'expiring'
                                            ? 'Expiry-first review mode'
                                            : portfolioView === 'highValue'
                                                ? 'Highest value products'
                                                : 'Freshest additions first'}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-ink-muted">
                                    {portfolioView === 'all'
                                        ? 'See the full portfolio with search, category filters, and your preferred sorting rule.'
                                        : portfolioView === 'expiring'
                                            ? 'Bring the products with the closest renewal windows to the top of your review queue.'
                                            : portfolioView === 'highValue'
                                                ? 'Keep the most valuable items in easier reach when coverage matters more.'
                                                : 'Review the newest purchases while details and receipts are still easy to confirm.'}
                                </p>
                            </div>
                            <div className="rounded-surface border border-rule bg-surface px-5 py-4">
                                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-neutral">Current Search</p>
                                <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-ink">
                                    {portfolioSearch.trim() ? `"${portfolioSearch.trim()}"` : 'No active search'}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-ink-muted">
                                    Narrow the workspace by product, brand, or category without losing the bigger picture.
                                </p>
                            </div>
                            <div className="rounded-surface border border-rule bg-surface px-5 py-4">
                                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-neutral">Sort Rule</p>
                                <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-ink">
                                    {portfolioSort === 'priority'
                                        ? 'Dashboard priority'
                                        : portfolioSort === 'value'
                                            ? 'Highest value first'
                                            : portfolioSort === 'recent'
                                                ? 'Most recent first'
                                                : 'Expiry soonest first'}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-ink-muted">
                                    Switch the queue to match the way you want to review warranties today.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:gap-6">
                            {preparedWarranties.map(({ warranty, display }) => (
                                <div
                                    key={warranty._id || warranty.id}
                                    className={`transition-all duration-[900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                                        'translate-y-0 opacity-100'
                                    }`}
                                    style={{
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
                            <div className="mt-8 rounded-surface bg-surface-raised px-6 py-14 text-center">
                                <div className="empty-icon mb-5">
                                    <Boxes className="h-7 w-7 text-neutral" strokeWidth={2} />
                                </div>
                                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-neutral">No visible records</p>
                                <p className="mt-4 text-3xl font-semibold text-ink">No warranties match this view.</p>
                                <p className="mt-3 text-sm text-ink-muted">
                                    {portfolioSearch.trim()
                                        ? 'Try a broader search term or switch to another quick view to bring matching products back into the workspace.'
                                        : 'Choose another category, adjust the quick view, or add a new warranty to the portfolio.'}
                                </p>
                                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral">
                                    <ShieldCheck className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
                                    Portfolio will refill here
                                </div>
                                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                    <Link
                                        to="/warranties/new?mode=scan"
                                        className="row-interactive inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-center text-sm font-semibold text-on-accent transition-colors hover:bg-accent-pressed"
                                    >
                                        <ScanSearch className="h-4 w-4" strokeWidth={2} />
                                        Scan Receipt with AI
                                    </Link>
                                    <Link
                                        to="/warranties/new?mode=manual"
                                        className="row-interactive inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-surface px-5 py-3 text-center text-sm font-semibold text-ink ring-1 ring-rule transition-colors hover:bg-surface-raised"
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
                    <div className="rounded-surface bg-surface px-4 py-8 shadow-raised sm:rounded-surface sm:px-8 sm:py-10 lg:px-10">
                        <div className="grid gap-4 lg:grid-cols-3">
                            {trustSignals.map((signal, index) => (
                                <motion.div
                                    key={signal.label}
                                    className="row-interactive rounded-surface border border-rule bg-surface-raised p-6"
                                    initial={{ opacity: 0, y: 18 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <div className="inline-flex rounded-surface border border-accent bg-accent-wash p-3 text-accent">
                                        <ShieldCheck className="h-5 w-5" strokeWidth={2} />
                                    </div>
                                    <p className="mt-5 text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-neutral">{signal.label}</p>
                                    <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-ink">{signal.value}</h3>
                                    <p className="mt-3 text-sm leading-7 text-ink-muted">{signal.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="w-full px-4 pt-14 sm:px-8 sm:pt-16 lg:px-16">
                    <div className="rounded-surface bg-surface px-4 py-8 shadow-raised sm:rounded-surface sm:px-8 sm:py-10 lg:px-10">
                        <div className="max-w-3xl">
                            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-ink">Pricing</h2>
                            <HeadingAccent />
                            <p className="mt-6 text-base leading-8 text-ink-muted sm:text-lg">
                                Choose a workflow that fits the way you manage receipts, renewal alerts, and support claims. Keep it simple, or step into a more automated setup.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                {pricingTrustBadges.map((badge) => {
                                    const Icon = badge.icon;

                                    return (
                                        <div key={badge.label} className="page-chip">
                                            <Icon className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
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
                                    className={`row-interactive rounded-surface border p-6 ${
                                        tier.featured
                                            ? 'border-accent bg-[linear-gradient(180deg,#ffffff_0%,#f4fbff_100%)] shadow-raised'
                                            : 'border-rule bg-surface shadow-raised'
                                    }`}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.75, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-neutral">{tier.name}</p>
                                            <div className="mt-4 flex items-end gap-2">
                                                <span className="text-4xl font-semibold tracking-[-0.06em] text-ink">{tier.price}</span>
                                                <span className="pb-1 text-sm text-neutral">{tier.cadence}</span>
                                            </div>
                                        </div>
                                        {tier.featured && (
                                            <span className="rounded-full bg-accent px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-on-accent">
                                                Most Used
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-5 text-sm leading-7 text-ink-muted">{tier.description}</p>

                                    <div className="mt-6 space-y-3">
                                        {tier.features.map((feature) => (
                                            <div key={feature} className="flex items-start gap-3 text-sm text-ink-muted">
                                                <span className="mt-0.5 inline-flex rounded-full bg-accent-wash p-1 text-accent">
                                                    <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                                                </span>
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        to={tier.ctaTo}
                                        className={`row-interactive mt-7 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
                                            tier.featured
                                                ? 'bg-accent text-on-accent hover:bg-accent-pressed'
                                                : 'bg-surface-raised text-ink ring-1 ring-rule hover:bg-surface-raised'
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
                    <div className="rounded-surface bg-surface px-4 py-8 shadow-raised sm:rounded-surface sm:px-8 sm:py-10 lg:px-10">
                        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                            <div className="max-w-2xl">
                                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-ink">FAQ</h2>
                                <HeadingAccent />
                                <p className="mt-6 text-base leading-8 text-ink-muted sm:text-lg">
                                    A few quick answers around scanning, reminders, portfolio visibility, and claim readiness so the product feels straightforward from the first click.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {faqItems.map((item, index) => {
                                    const isOpen = activeFaq === index;

                                    return (
                                        <div key={item.question} className="overflow-hidden rounded-surface border border-rule bg-surface">
                                            <button
                                                type="button"
                                                onClick={() => setActiveFaq(isOpen ? -1 : index)}
                                                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                                            >
                                                <span className="text-base font-semibold tracking-[-0.02em] text-ink">{item.question}</span>
                                                <ChevronDown
                                                    className={`h-5 w-5 shrink-0 text-neutral transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
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
                                                        <div className="border-t border-rule px-5 py-4 text-sm leading-7 text-ink-muted">
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
                <div className="rounded-surface bg-surface px-4 py-8 shadow-raised sm:rounded-surface sm:px-8">
                        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end">
                            <div>
                            <div className="flex items-center gap-3">
                                <div className="rounded-surface bg-accent p-2.5 text-on-accent">
                                    <WarrantyProMark className="h-8 w-8" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold uppercase tracking-[0.24em] text-ink">Warranty Pro</div>
                                    <div className="text-sm text-ink-muted">Save proof. Track expiry. Stay claim-ready.</div>
                                </div>
                            </div>

                            <p className="mt-5 max-w-2xl text-sm leading-7 text-ink-muted">
                                A cleaner way to manage warranties across purchases, reminders, and support events without scattered receipts or rushed paperwork.
                            </p>
                        </div>

                        <div className="grid gap-3 text-sm text-ink-muted sm:grid-cols-2">
                            <Link to="/coverage" className="transition-colors hover:text-ink">Dashboard</Link>
                            <Link to="/warranties/new?mode=scan" className="transition-colors hover:text-ink">AI Receipt Scan</Link>
                            <Link to="/claims" className="transition-colors hover:text-ink">Claims</Link>
                            <Link to="/notifications" className="transition-colors hover:text-ink">Notifications</Link>
                            <Link to="/service-centers" className="transition-colors hover:text-ink">Service Centers</Link>
                            <Link to="/configuration" className="transition-colors hover:text-ink">Settings</Link>
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
                            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
                            <div className="relative z-10 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-neutral">
                                        {activeFeatureModal === 'intake' ? 'Choose Intake Mode' : 'Expiring Soon'}
                                    </p>
                                    <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-ink">
                                        {activeFeatureModal === 'intake'
                                            ? 'Bring a new warranty into the system.'
                                            : 'See which warranties need attention next.'}
                                    </h3>
                                    <p className="mt-4 max-w-xl text-sm leading-7 text-ink-muted">
                                        {activeFeatureModal === 'intake'
                                            ? 'Start with AI receipt scanning for speed or open the manual flow when you want full control over every detail.'
                                            : 'These products are nearing expiry within the next 45 days, so you can review coverage before it becomes urgent.'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeFeatureModal}
                                    className="rounded-full border border-rule p-2 text-neutral transition-colors hover:border-rule hover:text-ink"
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
                                        className="rounded-surface bg-accent px-5 py-5 text-left text-on-accent transition-transform duration-300 hover:-translate-y-1"
                                    >
                                        <div className="inline-flex rounded-surface bg-surface p-3">
                                            <ScanSearch className="h-5 w-5" strokeWidth={2} />
                                        </div>
                                        <div className="mt-5 text-lg font-semibold tracking-[-0.03em]">AI Scan</div>
                                        <p className="mt-3 text-sm leading-7 text-neutral">
                                            Upload a receipt and let the scanner prefill product, brand, price, and dates.
                                        </p>
                                        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-rule">
                                            Fastest path
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleIntakeChoice('manual')}
                                        className="rounded-surface border border-rule bg-surface-raised px-5 py-5 text-left text-ink transition-transform duration-300 hover:-translate-y-1 hover:border-rule"
                                    >
                                        <div className="inline-flex rounded-surface bg-surface p-3 text-ink-muted shadow-raised">
                                            <SquarePen className="h-5 w-5" strokeWidth={2} />
                                        </div>
                                        <div className="mt-5 text-lg font-semibold tracking-[-0.03em]">Add Manually</div>
                                        <p className="mt-3 text-sm leading-7 text-ink-muted">
                                            Create a record yourself when you want exact control over notes, dates, or coverage terms.
                                        </p>
                                        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-neutral">
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
                                                className="flex w-full items-center justify-between gap-4 rounded-surface border border-rule bg-surface-raised px-5 py-4 text-left transition-colors hover:border-rule hover:bg-surface-raised"
                                            >
                                                <div>
                                                    <div className="text-base font-semibold text-ink">
                                                        {item.warranty.product_name || item.warranty.brand || 'Untitled warranty'}
                                                    </div>
                                                    <div className="mt-2 text-sm text-ink-muted">
                                                        Expires {formatDateLabel(item.expiryDate.toISOString())}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-semibold text-ink">
                                                        {item.daysLeft === 0 ? 'Today' : `${item.daysLeft} days`}
                                                    </div>
                                                    <div className="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-expiring">
                                                        Review now
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="rounded-surface bg-surface-raised px-6 py-10 text-center">
                                            <div className="empty-icon mb-5">
                                                <BellRing className="h-7 w-7 text-neutral" strokeWidth={2} />
                                            </div>
                                            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-neutral">
                                                All clear
                                            </div>
                                            <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink">
                                                No warranties are expiring soon.
                                            </div>
                                            <p className="mt-3 text-sm leading-7 text-ink-muted">
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
                                            className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-pressed"
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

