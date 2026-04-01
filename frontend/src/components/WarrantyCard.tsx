import { Link } from 'react-router-dom';
import { BedSingle, CarFront, Laptop2, Smartphone } from 'lucide-react';
import { AppleGlyph, HpGlyph } from './HeritageIcons';
import { formatDate, getDaysRemaining } from '../lib/utils';

export type DashboardCardTone = 'ruby' | 'emerald' | 'amber' | 'silver';
export type DashboardCardIcon = 'vehicle' | 'bed' | 'laptop' | 'phone' | 'default';

export interface WarrantyCardDisplay {
    title?: string;
    dateLabel?: string;
    valueLabel?: string;
    lifePercent?: number;
    tone?: DashboardCardTone;
    icon?: DashboardCardIcon;
    brandLabel?: string;
    statusLabel?: string;
    showReminder?: boolean;
}

interface WarrantyCardProps {
    warranty: any;
    display?: WarrantyCardDisplay;
}

const formatCurrency = (value: number) =>
    Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

const iconClassName = 'h-5 w-5';

const renderIcon = (icon: DashboardCardIcon, warranty: any) => {
    const brand = String(warranty.brand || '').toLowerCase();

    if (icon === 'vehicle') {
        return <CarFront className={iconClassName} strokeWidth={1.9} />;
    }

    if (icon === 'bed') {
        return <BedSingle className={iconClassName} strokeWidth={1.9} />;
    }

    if (icon === 'laptop') {
        return brand.includes('hp')
            ? <HpGlyph className={iconClassName} />
            : <Laptop2 className={iconClassName} strokeWidth={1.9} />;
    }

    if (icon === 'phone') {
        return brand.includes('apple')
            ? <AppleGlyph className={iconClassName} />
            : <Smartphone className={iconClassName} strokeWidth={1.9} />;
    }

    return <Laptop2 className={iconClassName} strokeWidth={1.9} />;
};

const toneStyles: Record<DashboardCardTone, { gem: string; ring: string; text: string }> = {
    ruby: {
        gem: 'from-[#fff0f3] via-[#f15474] to-[#7b1029] shadow-[0_0_18px_rgba(241,84,116,0.28)]',
        ring: 'border-[#f5d3da] bg-[#fff8fa]',
        text: 'text-[#9f1239]',
    },
    emerald: {
        gem: 'from-[#eafff1] via-[#1fdb77] to-[#0d6f37] shadow-[0_0_18px_rgba(34,197,94,0.24)]',
        ring: 'border-[#d5f4e2] bg-[#f7fffa]',
        text: 'text-[#0f7a41]',
    },
    amber: {
        gem: 'from-[#fff7e3] via-[#d89c29] to-[#7e4d07] shadow-[0_0_18px_rgba(245,158,11,0.22)]',
        ring: 'border-[#f6ead0] bg-[#fffaf0]',
        text: 'text-[#a16207]',
    },
    silver: {
        gem: 'from-[#f8fafc] via-[#94a3b8] to-[#334155] shadow-[0_0_18px_rgba(148,163,184,0.2)]',
        ring: 'border-[#e5e7eb] bg-[#fafafa]',
        text: 'text-[#475569]',
    },
};

export const WarrantyCard = ({ warranty, display }: WarrantyCardProps) => {
    const purchaseDate = warranty.purchase_date ? new Date(warranty.purchase_date) : null;
    const expiryDate = purchaseDate
        ? new Date(new Date(warranty.purchase_date).setMonth(purchaseDate.getMonth() + warranty.warranty_duration_months))
        : null;
    const daysRemaining = expiryDate ? getDaysRemaining(expiryDate.toISOString()) : 0;
    const totalDays = Math.max(1, (warranty.warranty_duration_months || 0) * 30);
    const computedLife = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));
    const lifePercent = display?.lifePercent ?? Math.round(computedLife);
    const recordId = warranty._id || warranty.id;
    const tone = display?.tone ?? (lifePercent >= 100 ? 'emerald' : lifePercent <= 1 ? 'ruby' : lifePercent <= 20 ? 'amber' : 'silver');
    const gemTone = toneStyles[tone];
    const title = display?.title ?? warranty.product_name;
    const dateLabel = display?.dateLabel ?? (purchaseDate ? formatDate(warranty.purchase_date) : 'Pending');
    const valueLabel = display?.valueLabel ?? formatCurrency(warranty.price || 0);
    const icon = display?.icon ?? 'default';
    const showReminder = display?.showReminder ?? (daysRemaining <= 30 && daysRemaining > 0);

    return (
        <article className="group relative overflow-hidden rounded-[1.6rem] bg-white p-4 shadow-[0_22px_50px_rgba(15,23,42,0.08)] transition-transform duration-300 hover:-translate-y-1 sm:rounded-[1.9rem] sm:p-6">
            <div className="relative flex h-full flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
                            {display?.brandLabel ?? (warranty.brand || 'Warranty Pro')}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-slate-100 p-2.5 text-slate-700 sm:p-3">
                                {renderIcon(icon, warranty)}
                            </div>
                            <div className="min-w-0">
                                <h3 className="truncate text-lg font-semibold tracking-[-0.03em] text-slate-950 sm:text-xl">
                                    {title}
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">{dateLabel}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-[1rem] border px-2.5 py-2 sm:rounded-[1.1rem] sm:px-3 ${gemTone.ring}`}>
                        <div className={`h-5 w-5 rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--tw-gradient-from),var(--tw-gradient-via),var(--tw-gradient-to))] ${gemTone.gem}`} />
                        <div className={`mt-1.5 text-center text-sm font-semibold ${gemTone.text}`}>{lifePercent}%</div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                            Coverage Value
                        </p>
                        <div className="mt-1.5 break-words text-[1.7rem] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[2rem]">
                            {valueLabel}
                        </div>
                    </div>
                    <div className="w-fit rounded-full bg-slate-100 px-3 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-slate-600">
                        {display?.statusLabel ?? 'Active'}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs leading-6 text-slate-500">
                    <span>
                        {expiryDate ? `Expires ${formatDate(expiryDate.toISOString())}` : 'Expiry pending'}
                    </span>
                    {showReminder && (
                        <span className="text-amber-600">- Reminder ready</span>
                    )}
                </div>

                <div className="mt-auto grid gap-3 sm:grid-cols-2">
                    <Link
                        to={`/warranties/${recordId}`}
                        className="min-h-11 rounded-full bg-slate-950 px-4 py-3 text-center text-[0.62rem] font-bold uppercase tracking-[0.24em] text-white transition-colors duration-200 hover:bg-slate-800"
                    >
                        View Details
                    </Link>
                    <Link
                        to={`/claims/new?warrantyId=${recordId}`}
                        className="min-h-11 rounded-full border border-slate-200 bg-white px-4 py-3 text-center text-[0.62rem] font-bold uppercase tracking-[0.24em] text-slate-900 transition-colors duration-200 hover:bg-slate-50"
                    >
                        Start Claim
                    </Link>
                </div>
            </div>
        </article>
    );
};
