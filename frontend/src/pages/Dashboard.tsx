import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Camera, Clock3, Cloud, Feather, Plus, Search, Settings2, ShieldCheck, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { warrantiesApi } from '../lib/api';
import { CategoryFilter } from '../components/CategoryFilter';
import { FamilyCrest } from '../components/HeritageIcons';
import { WarrantyCard } from '../components/WarrantyCard';
import { getDaysRemaining } from '../lib/utils';

const formatCurrency = (value: number) =>
    Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

export const Dashboard = () => {
    const [warranties, setWarranties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All Items');

    useEffect(() => {
        loadData();
    }, []);

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

    const totalValue = useMemo(() => warranties.reduce((acc, curr) => acc + (curr.price || 0), 0), [warranties]);

    const expiringSoonCount = useMemo(() => warranties.filter((warranty) => {
        if (!warranty.purchase_date) {
            return false;
        }

        const purchaseDate = new Date(warranty.purchase_date);
        const expiryDate = new Date(new Date(warranty.purchase_date).setMonth(purchaseDate.getMonth() + warranty.warranty_duration_months));
        const days = getDaysRemaining(expiryDate.toISOString());
        return days > 0 && days <= 30;
    }).length, [warranties]);

    const protectionStatus = expiringSoonCount > 2 ? 'At Risk' : expiringSoonCount > 0 ? 'Needs Attention' : 'Excellent';
    const categories = ['All Items', ...Array.from(new Set(warranties.map((warranty) => warranty.categoryId || 'Other'))).filter(Boolean)];
    const filteredWarranties = selectedCategory === 'All Items'
        ? warranties
        : warranties.filter((warranty) => warranty.categoryId === selectedCategory);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#4e3014_0%,#201108_52%,#120904_100%)] px-6">
                <div className="rounded-[2rem] border border-[#b48b4a] bg-[linear-gradient(145deg,#5f3817_0%,#24150a_100%)] p-8 shadow-[0_28px_55px_rgba(9,4,2,0.45)]">
                    <div className="flex items-center gap-4 rounded-[1.5rem] border border-[#c8a35b]/65 bg-[linear-gradient(180deg,rgba(255,248,228,0.12),rgba(255,226,163,0.06))] px-6 py-5">
                        <div className="h-10 w-10 rounded-full border-2 border-[#d7bc7c] border-t-transparent animate-spin" />
                        <div>
                            <p
                                className="text-[0.72rem] font-semibold uppercase tracking-[0.38em] text-[#e7d0a0]"
                                style={{ fontFamily: '"Cinzel", serif' }}
                            >
                                Khaandaani Ledger
                            </p>
                            <p className="mt-1 text-sm text-[#f5ead0]">Opening the warranty vault...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <div className="mx-auto max-w-[1580px]">
                <section className="relative overflow-hidden rounded-[3rem] bg-[radial-gradient(circle_at_top,#513015_0%,#1f1209_55%,#0f0906_100%)] p-4 shadow-[0_35px_90px_rgba(11,4,2,0.55)] sm:p-6 lg:p-8">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.05),rgba(255,255,255,0)_22%,rgba(0,0,0,0.2)_75%)]" />
                    <div className="pointer-events-none absolute inset-[7%] rounded-[2.6rem] border border-[#7a4d20]/55 bg-[radial-gradient(circle_at_top,rgba(64,37,16,0.45),rgba(18,9,4,0.28))]" />
                    <div className="pointer-events-none absolute inset-x-[10%] inset-y-[12%] rounded-[2.4rem] border border-[#9f7236]/30 bg-[linear-gradient(180deg,rgba(173,128,61,0.08),rgba(0,0,0,0))]" />

                    <div className="pointer-events-none absolute left-[7%] right-[7%] top-[11%] bottom-[11%] rounded-[2.4rem] bg-[linear-gradient(180deg,rgba(173,84,35,0.12),rgba(84,45,18,0.04))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />

                    <div className="pointer-events-none absolute -right-2 top-16 hidden h-56 w-20 rotate-[24deg] items-start justify-center xl:flex">
                        <div className="relative flex h-full w-full items-start justify-center">
                            <div className="absolute top-16 h-32 w-2 rounded-full bg-[linear-gradient(180deg,#e7c57d_0%,#8e6020_100%)] shadow-[0_12px_28px_rgba(48,23,5,0.35)]" />
                            <div className="absolute top-0 rounded-[2rem] border border-[#d6b36c]/70 bg-[linear-gradient(180deg,#f3d697_0%,#b57d34_100%)] p-3 text-[#68451a] shadow-[0_14px_25px_rgba(43,18,4,0.35)]">
                                <Feather className="h-10 w-10" strokeWidth={1.7} />
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-[2.6rem] border border-[#8d6433]/85 bg-[linear-gradient(145deg,#5f3616_0%,#3b220f_42%,#1b1008_100%)] p-3 shadow-[0_28px_70px_rgba(12,5,2,0.45)] sm:p-4 lg:p-5">
                        <div className="pointer-events-none absolute inset-0 opacity-90 [background-image:linear-gradient(rgba(222,181,101,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(222,181,101,0.06)_1px,transparent_1px)] [background-size:120px_120px]" />

                        <div className="relative rounded-[2.15rem] border border-[#b48c51]/45 bg-[radial-gradient(circle_at_top,#7a4b20_0%,#5a3215_30%,#3b220f_56%,#28170d_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-24px_40px_rgba(0,0,0,0.24)] sm:p-7">
                            <div className="absolute right-6 top-6 flex items-center gap-3 rounded-full border border-[#c29a59]/70 bg-[linear-gradient(180deg,rgba(255,245,214,0.15),rgba(255,230,167,0.08))] px-4 py-2 text-[#eedfb4] shadow-[0_12px_24px_rgba(9,4,2,0.22)]">
                                <div className="rounded-full border border-[#d2ae6f] bg-[linear-gradient(180deg,#f8de9a_0%,#a16d27_100%)] p-2 text-[#5c3b11]">
                                    <Camera className="h-4 w-4" strokeWidth={1.9} />
                                </div>
                                <div>
                                    <p
                                        className="text-[0.58rem] font-semibold uppercase tracking-[0.34em] text-[#e5d3aa]"
                                        style={{ fontFamily: '"Cinzel", serif' }}
                                    >
                                        OCR Scan Lens
                                    </p>
                                    <p className="text-xs text-[#cdb790]">Receipt capture ready</p>
                                </div>
                            </div>

                            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(330px,0.8fr)]">
                                <div className="rounded-[2rem] border border-[#c7a35e]/55 bg-[linear-gradient(180deg,rgba(255,248,229,0.09),rgba(255,226,171,0.04))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-5">
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                                        <FamilyCrest className="w-full max-w-[280px] flex-none" />

                                        <div className="min-w-0 flex-1">
                                            <div
                                                className="inline-flex rounded-full border border-[#c6a35f] bg-[linear-gradient(180deg,#fff0c7_0%,#d6a44d_100%)] px-4 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.42em] text-[#6a4917] shadow-[0_10px_18px_rgba(97,64,12,0.2)]"
                                                style={{ fontFamily: '"Cinzel", serif' }}
                                            >
                                                Bespoke Digital Warranty Ledger
                                            </div>
                                            <h1
                                                className="mt-4 text-4xl font-semibold leading-none text-[#fff4da] sm:text-5xl"
                                                style={{ fontFamily: '"Cormorant Garamond", serif' }}
                                            >
                                                Khaandaani Warranty Ledger
                                            </h1>
                                            <p className="mt-4 max-w-2xl text-base leading-7 text-[#ddc9a0] sm:text-lg">
                                                Hand-carved mahogany, gold inlay, and family-grade record keeping for every protected asset in your household estate.
                                            </p>

                                            <div className="mt-5 inline-flex max-w-full items-center rounded-[1.2rem] border border-[#c09a5c]/80 bg-[linear-gradient(180deg,#f6d899_0%,#b27a30_100%)] px-4 py-3 text-[#59380f] shadow-[0_14px_24px_rgba(72,41,6,0.24)]">
                                                <span
                                                    className="mr-3 text-[0.62rem] font-semibold uppercase tracking-[0.42em]"
                                                    style={{ fontFamily: '"Cinzel", serif' }}
                                                >
                                                    Brass Plaque
                                                </span>
                                                <span className="truncate text-sm font-semibold">warranty-pro-vert.vercel.app</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                                    <div className="rounded-[1.75rem] border border-[#c6a35e]/55 bg-[linear-gradient(180deg,rgba(255,248,229,0.12),rgba(255,226,171,0.05))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p
                                                    className="text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-[#dec89f]"
                                                    style={{ fontFamily: '"Cinzel", serif' }}
                                                >
                                                    Total Protection Value
                                                </p>
                                                <div
                                                    className="mt-3 text-[2.3rem] font-semibold leading-none text-[#fff4da]"
                                                    style={{ fontFamily: '"Cormorant Garamond", serif' }}
                                                >
                                                    {formatCurrency(totalValue)}
                                                </div>
                                                <p className="mt-3 text-sm text-[#ceb78f]">
                                                    Protection status: <span className="font-semibold text-[#f7e6ba]">{protectionStatus}</span>
                                                </p>
                                            </div>
                                            <div className="rounded-[1.2rem] border border-[#cfaa67] bg-[linear-gradient(180deg,#fde5aa_0%,#b37a2e_100%)] p-3 text-[#5f3e15] shadow-[0_12px_22px_rgba(81,48,6,0.22)]">
                                                <ShieldCheck className="h-6 w-6" strokeWidth={2} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-[1.75rem] border border-[#c6a35e]/55 bg-[linear-gradient(180deg,rgba(255,248,229,0.12),rgba(255,226,171,0.05))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p
                                                    className="text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-[#dec89f]"
                                                    style={{ fontFamily: '"Cinzel", serif' }}
                                                >
                                                    Imminent Reminder
                                                </p>
                                                <div
                                                    className="mt-3 text-[2.1rem] font-semibold leading-none text-[#fff4da]"
                                                    style={{ fontFamily: '"Cormorant Garamond", serif' }}
                                                >
                                                    {expiringSoonCount}
                                                </div>
                                                <p className="mt-3 text-sm text-[#ceb78f]">
                                                    Amber clock markers now appear on entries that are nearing expiry.
                                                </p>
                                            </div>
                                            <div className="rounded-[1.2rem] border border-[#d5ab60] bg-[linear-gradient(180deg,#ffe9ae_0%,#b67b27_100%)] p-3 text-[#6a4510] shadow-[0_12px_22px_rgba(81,48,6,0.22)]">
                                                <Clock3 className="h-6 w-6" strokeWidth={2} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                                <div className="rounded-[1.8rem] border border-[#c6a35e]/55 bg-[linear-gradient(180deg,rgba(255,248,229,0.1),rgba(255,226,171,0.04))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                    <div className="grid gap-3 sm:grid-cols-4">
                                        {[
                                            { icon: Search, label: 'Search', caption: 'Instant record lookup' },
                                            { icon: UsersRound, label: 'Family Sharing', caption: 'Shared household access' },
                                            { icon: Cloud, label: 'Cloud + Vault', caption: 'Backed up inheritance vault' },
                                            { icon: Settings2, label: 'Settings', caption: 'Ledger controls and policies' },
                                        ].map((feature) => (
                                            <div
                                                key={feature.label}
                                                className="rounded-[1.35rem] border border-[#c9a86a]/60 bg-[linear-gradient(180deg,rgba(255,248,226,0.14),rgba(255,229,180,0.05))] px-4 py-3 text-[#f8ebca] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-full border border-[#d3b16f] bg-[linear-gradient(180deg,#fbe1a1_0%,#b5792d_100%)] p-2 text-[#614014]">
                                                        <feature.icon className="h-4 w-4" strokeWidth={1.9} />
                                                    </div>
                                                    <div>
                                                        <p
                                                            className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#f2dfb7]"
                                                            style={{ fontFamily: '"Cinzel", serif' }}
                                                        >
                                                            {feature.label}
                                                        </p>
                                                        <p className="mt-1 text-xs text-[#ccb58e]">{feature.caption}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                    <Link
                                        to="/warranties/new?mode=scan"
                                        className="rounded-full border border-[#c6a15b] bg-[linear-gradient(180deg,#fff0c8_0%,#dcae57_100%)] px-5 py-4 text-center text-[0.68rem] font-bold uppercase tracking-[0.34em] text-[#5d3d13] shadow-[0_12px_20px_rgba(87,54,8,0.2)] transition-transform duration-200 hover:-translate-y-0.5"
                                        style={{ fontFamily: '"Cinzel", serif' }}
                                    >
                                        Scan Receipt
                                    </Link>
                                    <Link
                                        to="/warranties/new?mode=manual"
                                        className="rounded-full border border-[#b98a44] bg-[linear-gradient(180deg,#d8bb78_0%,#98691f_100%)] px-5 py-4 text-center text-[0.68rem] font-bold uppercase tracking-[0.34em] text-[#fff6e3] shadow-[0_14px_22px_rgba(63,37,5,0.28)] transition-transform duration-200 hover:-translate-y-0.5"
                                        style={{ fontFamily: '"Cinzel", serif' }}
                                    >
                                        Add Entry
                                    </Link>
                                </div>
                            </div>

                            {expiringSoonCount > 0 && (
                                <Link to="/notifications" className="mt-6 block">
                                    <div className="rounded-[1.8rem] border border-[#c99548]/60 bg-[linear-gradient(180deg,rgba(255,230,179,0.24),rgba(166,104,19,0.18))] p-4 shadow-[0_16px_30px_rgba(31,14,4,0.2)] transition-transform duration-200 hover:-translate-y-0.5">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="rounded-[1.2rem] border border-[#dbb266] bg-[linear-gradient(180deg,#ffe7af_0%,#bd7d24_100%)] p-3 text-[#6a4410]">
                                                    <AlertTriangle className="h-5 w-5" strokeWidth={2.2} />
                                                </div>
                                                <div>
                                                    <p
                                                        className="text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-[#f4deb1]"
                                                        style={{ fontFamily: '"Cinzel", serif' }}
                                                    >
                                                        Reminder Ledger
                                                    </p>
                                                    <p className="mt-1 text-sm text-[#f9e8c4]">
                                                        {expiringSoonCount} record{expiringSoonCount === 1 ? '' : 's'} now carry the antique amber reminder clock.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="inline-flex items-center gap-2 rounded-full border border-[#ddb264] bg-[#fff2cf]/10 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#ffecc4]">
                                                <span>Review Notices</span>
                                                <Plus className="h-4 w-4 rotate-45" strokeWidth={2.2} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )}

                            <div className="mt-8">
                                <CategoryFilter
                                    categories={categories}
                                    selected={selectedCategory}
                                    onSelect={setSelectedCategory}
                                />
                            </div>

                            <div className="mt-8 grid gap-6 md:grid-cols-2">
                                {filteredWarranties.map((warranty) => (
                                    <WarrantyCard key={warranty._id || warranty.id} warranty={warranty} />
                                ))}
                            </div>

                            {filteredWarranties.length === 0 && (
                                <div className="mt-8 rounded-[2rem] border border-dashed border-[#c7a35e]/60 bg-[linear-gradient(180deg,rgba(255,248,229,0.1),rgba(255,226,171,0.03))] px-6 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                    <p
                                        className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-[#e0c99f]"
                                        style={{ fontFamily: '"Cinzel", serif' }}
                                    >
                                        Heritage Record Search
                                    </p>
                                    <p
                                        className="mt-4 text-3xl font-semibold text-[#fff1d4]"
                                        style={{ fontFamily: '"Cormorant Garamond", serif' }}
                                    >
                                        No records match this cabinet filter.
                                    </p>
                                    <p className="mt-3 text-sm text-[#d5bf97]">
                                        Choose another category or add a new warranty plate to the ledger.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
