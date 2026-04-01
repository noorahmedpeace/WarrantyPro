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
        gem: 'from-[#fff0f3] via-[#f15474] to-[#7b1029] shadow-[0_0_22px_rgba(241,84,116,0.45)]',
        ring: 'border-[#dcb3ba]/55 bg-[linear-gradient(180deg,rgba(250,82,117,0.16),rgba(74,13,28,0.05))]',
        text: 'text-[#ffe7eb]',
    },
    emerald: {
        gem: 'from-[#eafff1] via-[#1fdb77] to-[#0d6f37] shadow-[0_0_22px_rgba(34,197,94,0.45)]',
        ring: 'border-[#a8d7bb]/55 bg-[linear-gradient(180deg,rgba(26,214,116,0.14),rgba(7,38,24,0.05))]',
        text: 'text-[#ebfff3]',
    },
    amber: {
        gem: 'from-[#fff7e3] via-[#d89c29] to-[#7e4d07] shadow-[0_0_22px_rgba(245,158,11,0.45)]',
        ring: 'border-[#d8c197]/55 bg-[linear-gradient(180deg,rgba(245,158,11,0.14),rgba(74,44,8,0.05))]',
        text: 'text-[#fff5df]',
    },
    silver: {
        gem: 'from-[#f8fafc] via-[#94a3b8] to-[#334155] shadow-[0_0_22px_rgba(148,163,184,0.35)]',
        ring: 'border-[#c2cbda]/55 bg-[linear-gradient(180deg,rgba(148,163,184,0.14),rgba(30,41,59,0.06))]',
        text: 'text-[#f8fafc]',
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
        <article className="group relative overflow-hidden rounded-[2rem] border border-[#d7b97a]/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.13),rgba(255,255,255,0.04))] p-[1px] shadow-[0_26px_60px_rgba(2,12,32,0.34)]">
            <div className="relative h-full overflow-hidden rounded-[calc(2rem-1px)] border border-white/10 bg-[linear-gradient(180deg,rgba(18,34,60,0.76),rgba(10,20,37,0.72))] p-4 backdrop-blur-xl sm:p-5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0)_34%,rgba(214,176,99,0.1)_100%)]" />
                <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.5),rgba(255,255,255,0))]" />

                <div className="relative flex h-full flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#f4dfad]">
                                {display?.brandLabel ?? (warranty.brand || 'Warranty Pro')}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl border border-[#e0c48b]/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-3 text-[#f8f4eb]">
                                    {renderIcon(icon, warranty)}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="truncate text-lg font-semibold tracking-[-0.03em] text-white sm:text-[1.28rem]">
                                        {title}
                                    </h3>
                                    <p className="mt-0.5 text-sm text-[#d5e2f5]">{dateLabel}</p>
                                </div>
                            </div>
                        </div>

                        <div className={`rounded-[1.1rem] border px-3 py-2 ${gemTone.ring}`}>
                            <div className={`h-5 w-5 rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--tw-gradient-from),var(--tw-gradient-via),var(--tw-gradient-to))] ${gemTone.gem}`} />
                            <div className={`mt-1.5 text-center text-sm font-semibold ${gemTone.text}`}>{lifePercent}%</div>
                        </div>
                    </div>

                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[#a9bfd9]">
                                Coverage Value
                            </p>
                            <div className="mt-1.5 text-[1.95rem] font-semibold tracking-[-0.04em] text-white">
                                {valueLabel}
                            </div>
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#dce8f8]">
                            {display?.statusLabel ?? 'Active'}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#bfd1e9]">
                        <span>
                            {expiryDate ? `Expires ${formatDate(expiryDate.toISOString())}` : 'Expiry pending'}
                        </span>
                        {showReminder && (
                            <span className="text-[#f7deb0]">• Reminder ready</span>
                        )}
                    </div>

                    <div className="mt-auto grid gap-3 sm:grid-cols-2">
                        <Link
                            to={`/warranties/${recordId}`}
                            className="rounded-full border border-[#e0c48b]/35 bg-[linear-gradient(180deg,#f8deb0_0%,#c99236_100%)] px-4 py-2.5 text-center text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[#2c1b05] shadow-[0_12px_22px_rgba(201,146,54,0.2)] transition-colors duration-200 hover:brightness-105"
                        >
                            View Details
                        </Link>
                        <Link
                            to={`/claims/new?warrantyId=${recordId}`}
                            className="rounded-full border border-[#dfc792]/35 bg-[linear-gradient(180deg,#fef4d9_0%,#d4a14b_100%)] px-4 py-2.5 text-center text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[#2d1c07] shadow-[0_12px_22px_rgba(208,158,65,0.2)] transition-colors duration-200 hover:brightness-105"
                        >
                            Start Claim
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
};
