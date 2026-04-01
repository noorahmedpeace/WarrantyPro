import { Link } from 'react-router-dom';
import { AlertTriangle, BedDouble, Clock3, ShieldCheck, Smartphone, UtensilsCrossed } from 'lucide-react';
import { AppleGlyph, HpGlyph } from './HeritageIcons';
import { formatDate, getDaysRemaining } from '../lib/utils';

interface WarrantyCardProps {
    warranty: any;
}

const formatCurrency = (value: number) =>
    Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

const getProductSeal = (warranty: any) => {
    const productName = String(warranty.product_name || '').toLowerCase();
    const brand = String(warranty.brand || '').toLowerCase();
    const sealClassName = 'h-6 w-6';

    if (productName.includes('iphone') || brand.includes('apple')) {
        return <AppleGlyph className={sealClassName} />;
    }

    if (productName.includes('laptop') || brand.includes('hp')) {
        return <HpGlyph className={sealClassName} />;
    }

    if (productName.includes('bed')) {
        return <BedDouble className={sealClassName} strokeWidth={1.7} />;
    }

    if (productName.includes('fish') || productName.includes('chips') || brand.includes('food')) {
        return <UtensilsCrossed className={sealClassName} strokeWidth={1.7} />;
    }

    if (productName.includes('phone')) {
        return <Smartphone className={sealClassName} strokeWidth={1.7} />;
    }

    return <ShieldCheck className={sealClassName} strokeWidth={1.7} />;
};

export const WarrantyCard = ({ warranty }: WarrantyCardProps) => {
    const purchaseDate = warranty.purchase_date ? new Date(warranty.purchase_date) : null;
    const expiryDate = purchaseDate
        ? new Date(new Date(warranty.purchase_date).setMonth(purchaseDate.getMonth() + warranty.warranty_duration_months))
        : null;
    const daysRemaining = expiryDate ? getDaysRemaining(expiryDate.toISOString()) : 0;
    const totalDays = Math.max(1, (warranty.warranty_duration_months || 0) * 30);
    const lifePercentage = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));
    const isExpiring = daysRemaining <= 30 && daysRemaining > 0;
    const isExpired = daysRemaining <= 0;
    const recordId = warranty._id || warranty.id;

    const gemClasses = isExpired
        ? 'from-slate-200 via-slate-400 to-slate-700 shadow-[0_0_18px_rgba(100,116,139,0.45)]'
        : isExpiring
            ? 'from-[#ffe8a4] via-[#d4a24b] to-[#8c5f14] shadow-[0_0_20px_rgba(245,158,11,0.5)]'
            : 'from-[#d7ffd5] via-[#2fa063] to-[#12562e] shadow-[0_0_20px_rgba(22,163,74,0.48)]';

    const statusText = isExpired ? 'Expired record' : isExpiring ? 'Imminent expiry' : 'Protected and active';
    const detailsLabel = purchaseDate ? `Purchased ${formatDate(warranty.purchase_date)}` : 'Heritage entry';

    return (
        <article className="group relative overflow-hidden rounded-[2rem] border border-[#8c6735]/80 bg-[linear-gradient(145deg,#5d3414_0%,#3b210f_42%,#1d1209_100%)] p-[1px] shadow-[0_24px_55px_rgba(19,10,3,0.45)] transition-transform duration-300 hover:-translate-y-1">
            <div className="relative h-full overflow-hidden rounded-[calc(2rem-1px)] border border-[#d4b06b]/45 bg-[radial-gradient(circle_at_top,#fdf8ec_0%,#f3e5c9_46%,#dfc18f_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-16px_26px_rgba(129,90,20,0.15)]">
                <div className="pointer-events-none absolute inset-x-6 top-0 h-12 rounded-b-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0))]" />
                <div className="pointer-events-none absolute inset-y-4 left-3 w-px bg-[linear-gradient(180deg,rgba(141,101,39,0),rgba(141,101,39,0.55),rgba(141,101,39,0))]" />
                <div className="pointer-events-none absolute inset-y-4 right-3 w-px bg-[linear-gradient(180deg,rgba(141,101,39,0),rgba(141,101,39,0.55),rgba(141,101,39,0))]" />

                <div className="relative flex h-full flex-col gap-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div
                                className="mb-3 inline-flex items-center rounded-full border border-[#c4a25d] bg-[linear-gradient(180deg,#fdf0c7_0%,#d5a347_100%)] px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.36em] text-[#694918] shadow-[0_8px_14px_rgba(110,74,13,0.18)]"
                                style={{ fontFamily: '"Cinzel", serif' }}
                            >
                                {warranty.brand || 'Warranty Pro'}
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="min-w-0">
                                    <h3
                                        className="text-[1.7rem] font-semibold leading-none text-[#3f2a12] sm:text-[1.9rem]"
                                        style={{ fontFamily: '"Cormorant Garamond", serif' }}
                                    >
                                        {warranty.product_name}
                                    </h3>
                                    <p className="mt-2 text-sm font-medium text-[#7b6033]">
                                        {detailsLabel}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <div className="rounded-[1.25rem] border border-[#b3873c] bg-[linear-gradient(160deg,#fff4d7_0%,#ddb05a_100%)] p-3 text-[#6d4816] shadow-[0_12px_22px_rgba(89,55,8,0.22)]">
                                {getProductSeal(warranty)}
                            </div>
                            {isExpiring && (
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#c0903f] bg-[#f8e4b1]/90 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[#865816] shadow-[0_10px_20px_rgba(143,95,23,0.12)]">
                                    <Clock3 className="h-3.5 w-3.5" strokeWidth={1.8} />
                                    Reminder
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-[auto,1fr] gap-4 rounded-[1.7rem] border border-[#d9bd8a] bg-[linear-gradient(180deg,rgba(255,250,239,0.92),rgba(239,220,182,0.95))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_14px_22px_rgba(78,48,11,0.08)]">
                        <div className="flex flex-col items-center justify-center rounded-[1.35rem] border border-[#b59054] bg-[radial-gradient(circle_at_35%_35%,#fff6d9_0%,#eed8a3_45%,#d0a24f_100%)] px-4 py-3 text-[#5f4214] shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_10px_16px_rgba(116,78,20,0.18)]">
                            <div className={`h-6 w-6 rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--tw-gradient-from),var(--tw-gradient-via),var(--tw-gradient-to))] ${gemClasses}`} />
                            <span
                                className="mt-2 text-[0.58rem] font-semibold uppercase tracking-[0.42em]"
                                style={{ fontFamily: '"Cinzel", serif' }}
                            >
                                Life
                            </span>
                            <span className="mt-1 text-lg font-bold">{Math.round(lifePercentage)}%</span>
                        </div>

                        <div className="min-w-0 rounded-[1.4rem] border border-[#e1cb9f] bg-[linear-gradient(180deg,rgba(255,253,247,0.95),rgba(241,227,198,0.88))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p
                                        className="text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-[#8d6e3a]"
                                        style={{ fontFamily: '"Cinzel", serif' }}
                                    >
                                        Estate Value
                                    </p>
                                    <div
                                        className="mt-2 text-[2rem] font-semibold leading-none text-[#35210b]"
                                        style={{ fontFamily: '"Cormorant Garamond", serif' }}
                                    >
                                        {formatCurrency(warranty.price || 0)}
                                    </div>
                                </div>
                                <div className="rounded-full border border-[#d2b179] bg-[#fff6df] px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#876536]">
                                    {statusText}
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-[#7c633a]">
                                <span className="rounded-full border border-[#dcc69b] bg-[#fffaf0] px-2.5 py-1">
                                    Expiry: {expiryDate ? formatDate(expiryDate.toISOString()) : 'Pending'}
                                </span>
                                {isExpiring && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d0a14e] bg-[#fff1c9] px-2.5 py-1 text-[#8b5d11]">
                                        <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} />
                                        Claim window closing
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto grid gap-3 sm:grid-cols-2">
                        <Link
                            to={`/warranties/${recordId}`}
                            className="rounded-full border border-[#c6a15a] bg-[linear-gradient(180deg,#fff5d6_0%,#dfb15b_100%)] px-4 py-3 text-center text-[0.68rem] font-bold uppercase tracking-[0.34em] text-[#634313] shadow-[0_12px_20px_rgba(92,58,9,0.16)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(92,58,9,0.24)]"
                            style={{ fontFamily: '"Cinzel", serif' }}
                        >
                            View Details
                        </Link>
                        <Link
                            to={`/claims/new?warrantyId=${recordId}`}
                            className="rounded-full border border-[#b58a43] bg-[linear-gradient(180deg,#d8bc78_0%,#9a6c24_100%)] px-4 py-3 text-center text-[0.68rem] font-bold uppercase tracking-[0.34em] text-[#fff7e7] shadow-[0_14px_24px_rgba(73,43,7,0.24)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(73,43,7,0.3)]"
                            style={{ fontFamily: '"Cinzel", serif' }}
                        >
                            Start Claim
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
};
