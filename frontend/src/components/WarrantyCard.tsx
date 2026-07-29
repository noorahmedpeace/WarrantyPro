import { Link } from 'react-router-dom';
import { BedSingle, CarFront, Laptop2, Smartphone, X } from 'lucide-react';
import { CoverageMeter } from './ui/CoverageMeter';
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
    onDelete?: (warranty: any) => void;
    deleting?: boolean;
}

const formatCurrency = (value: number) =>
    Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

const iconClassName = 'h-5 w-5';

const getSafeDate = (value: unknown) => {
    if (!value) {
        return null;
    }

    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? null : date;
};

const renderIcon = (icon: DashboardCardIcon) => {
    if (icon === 'vehicle') {
        return <CarFront className={iconClassName} strokeWidth={1.9} />;
    }

    if (icon === 'bed') {
        return <BedSingle className={iconClassName} strokeWidth={1.9} />;
    }

    if (icon === 'laptop') {
        return <Laptop2 className={iconClassName} strokeWidth={1.9} />;
    }

    if (icon === 'phone') {
        return <Smartphone className={iconClassName} strokeWidth={1.9} />;
    }

    return <Laptop2 className={iconClassName} strokeWidth={1.9} />;
};

export const WarrantyCard = ({ warranty, display, onDelete, deleting = false }: WarrantyCardProps) => {
    const purchaseDate = getSafeDate(warranty.purchase_date);
    const durationMonths = Number(warranty.warranty_duration_months || 0);
    const expiryDate = purchaseDate && Number.isFinite(durationMonths) && durationMonths > 0
        ? new Date(new Date(purchaseDate).setMonth(purchaseDate.getMonth() + durationMonths))
        : null;
    const safeExpiryDate = expiryDate && !Number.isNaN(expiryDate.getTime()) ? expiryDate : null;
    const daysRemaining = safeExpiryDate ? getDaysRemaining(safeExpiryDate.toISOString()) : 0;
    const recordId = warranty._id || warranty.id;
    const title = display?.title ?? warranty.product_name;
    const dateLabel = display?.dateLabel ?? (purchaseDate ? formatDate(purchaseDate.toISOString()) : 'Pending');
    const valueLabel = display?.valueLabel ?? formatCurrency(warranty.price || 0);
    const icon = display?.icon ?? 'default';

    return (
        <article className="group relative overflow-hidden rounded-[1.6rem] bg-white p-4 shadow-[0_22px_50px_rgba(15,23,42,0.08)] transition-transform duration-300 hover:-translate-y-1 sm:rounded-[1.9rem] sm:p-6">
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.08),transparent_38%)]" />
            </div>
            {onDelete && (
                <button
                    type="button"
                    onClick={() => onDelete(warranty)}
                    disabled={deleting}
                    className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white/96 px-2.5 py-2 text-red-600 shadow-[0_10px_20px_rgba(239,68,68,0.08)] transition-all duration-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:right-5 sm:top-5 sm:translate-x-2 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-x-0 sm:group-focus-within:opacity-100"
                    aria-label={`Delete ${title}`}
                    title="Delete warranty"
                >
                    <X className="h-4 w-4" strokeWidth={2.4} />
                    <span className="hidden text-[0.62rem] font-bold uppercase tracking-[0.18em] md:inline">
                        Delete
                    </span>
                </button>
            )}

            <div className="relative flex h-full flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
                            {display?.brandLabel ?? (warranty.brand || 'Warranty Pro')}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-slate-100 p-2.5 text-slate-700 sm:p-3">
                                {renderIcon(icon)}
                            </div>
                            <div className="min-w-0">
                                <h3 className="truncate text-lg font-semibold tracking-[-0.03em] text-slate-950 sm:text-xl">
                                    {title}
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">{dateLabel}</p>
                            </div>
                        </div>
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

                {/* The percentage gem that used to sit top-right said "64%" of an
                    unstated whole. A warranty is counted in months, so the meter
                    counts months and names the date it runs out. */}
                <div className="space-y-2">
                    <CoverageMeter
                        totalMonths={durationMonths}
                        remainingMonths={Math.ceil(daysRemaining / 30)}
                        remainingDays={daysRemaining}
                    />
                    <p className="tabular font-mono text-data-s text-neutral">
                        {safeExpiryDate
                            ? `Covered until ${formatDate(safeExpiryDate.toISOString())}`
                            : 'Expiry date not set'}
                    </p>
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
                        {deleting ? 'Deleting...' : 'Start Claim'}
                    </Link>
                </div>
            </div>
        </article>
    );
};
