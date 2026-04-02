import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Package, Plus, Shield, Sparkles, Wallet } from 'lucide-react';
import { warrantiesApi, claimsApi } from '../lib/api';
import { GlowingButton } from '../components/ui/GlowingButton';
import { ClaimStatusBadge } from '../components/ui/ClaimStatusBadge';
import { ClaimTimeline } from '../components/ui/ClaimTimeline';
import { formatDate, getDaysRemaining } from '../lib/utils';

const normalizeClaims = (payload: unknown): any[] => {
    if (Array.isArray(payload)) {
        return payload.filter((claim) => claim && typeof claim === 'object');
    }

    if (payload && typeof payload === 'object' && Array.isArray((payload as { claims?: unknown[] }).claims)) {
        return (payload as { claims: unknown[] }).claims.filter((claim) => claim && typeof claim === 'object') as any[];
    }

    return [];
};

const getSafeFormattedDate = (value: unknown, fallback = 'Date pending') => {
    if (!value) {
        return fallback;
    }

    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
        return fallback;
    }

    return formatDate(date.toISOString());
};

const getExpiryMeta = (purchaseDate: unknown, durationMonths: unknown) => {
    if (!purchaseDate) {
        return {
            isExpired: false,
            daysRemaining: null as number | null,
            expiryLabel: 'Expiry pending',
            coverageLabel: typeof durationMonths === 'number' ? `${durationMonths} months` : 'Coverage pending',
        };
    }

    const base = new Date(String(purchaseDate));
    if (Number.isNaN(base.getTime())) {
        return {
            isExpired: false,
            daysRemaining: null as number | null,
            expiryLabel: 'Expiry pending',
            coverageLabel: typeof durationMonths === 'number' ? `${durationMonths} months` : 'Coverage pending',
        };
    }

    const safeDuration = typeof durationMonths === 'number' ? durationMonths : Number(durationMonths) || 0;
    const expiry = new Date(base);
    expiry.setMonth(expiry.getMonth() + safeDuration);

    if (Number.isNaN(expiry.getTime())) {
        return {
            isExpired: false,
            daysRemaining: null as number | null,
            expiryLabel: 'Expiry pending',
            coverageLabel: safeDuration ? `${safeDuration} months` : 'Coverage pending',
        };
    }

    const daysRemaining = getDaysRemaining(expiry.toISOString());
    return {
        isExpired: daysRemaining < 0,
        daysRemaining,
        expiryLabel: formatDate(expiry.toISOString()),
        coverageLabel: safeDuration ? `${safeDuration} months` : 'Coverage pending',
    };
};

export const WarrantyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [warranty, setWarranty] = useState<any>(null);
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [warrantyData, claimsData] = await Promise.all([
                    warrantiesApi.getOne(id!),
                    claimsApi.getByWarranty(id!),
                ]);
                setWarranty(warrantyData);
                setClaims(normalizeClaims(claimsData));
            } catch (error) {
                console.error('Failed to load warranty', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!warranty) {
        return (
            <div className="page-shell max-w-4xl">
                <div className="page-empty">
                    <p className="text-2xl font-semibold text-slate-950">Warranty not found</p>
                </div>
            </div>
        );
    }

    const { isExpired, daysRemaining, expiryLabel, coverageLabel } = getExpiryMeta(
        warranty.purchase_date,
        warranty.warranty_duration_months
    );
    const claimCount = claims.length;
    const openClaimCount = claims.filter((claim) => claim?.status !== 'completed' && claim?.status !== 'rejected').length;

    return (
        <div className="page-shell max-w-5xl">
            <button onClick={() => navigate('/')} className="page-back">
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
            </button>

            <div className="space-y-6">
                <header className="page-header">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-5">
                            <div className="flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-sky-200 bg-sky-50 text-sky-600">
                                <Package className="w-10 h-10" />
                            </div>
                            <div>
                                <div className="page-chip">{warranty.brand || 'Warranty record'}</div>
                                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{warranty.product_name}</h1>
                                <p className="mt-2 text-sm text-slate-600">Detailed coverage information and full claim history.</p>
                            </div>
                        </div>
                        <Link to={`/warranties/${id}/file-claim`}>
                            <GlowingButton className="py-3 text-sm">
                                <Plus className="w-4 h-4" />
                                File Claim with AI
                            </GlowingButton>
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <SummaryCard
                        icon={<Sparkles className="w-4 h-4" />}
                        label="Coverage Ends"
                        value={expiryLabel}
                        helper={isExpired ? 'Protection window has expired' : 'Current warranty horizon'}
                    />
                    <SummaryCard
                        icon={<Shield className="w-4 h-4" />}
                        label="Open Claims"
                        value={String(openClaimCount)}
                        helper={openClaimCount > 0 ? 'Needs active follow-up' : 'Nothing pending right now'}
                    />
                    <SummaryCard
                        icon={<Wallet className="w-4 h-4" />}
                        label="Purchase Value"
                        value={warranty.product_value ? `$${Number(warranty.product_value).toLocaleString()}` : 'Not captured'}
                        helper={claimCount > 0 ? `${claimCount} claim records on file` : 'No claim history yet'}
                    />
                </div>

                <div className="page-section">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <InfoBlock icon={<Calendar className="w-4 h-4" />} label="Purchase Date" value={getSafeFormattedDate(warranty.purchase_date, 'Purchase pending')} />
                        <InfoBlock icon={<Shield className="w-4 h-4" />} label="Warranty Period" value={coverageLabel} />
                        <InfoBlock
                            icon={<Shield className="w-4 h-4" />}
                            label="Status"
                            value={isExpired ? 'Expired' : daysRemaining === null ? 'Coverage pending' : `${daysRemaining} days remaining`}
                        />
                    </div>
                </div>

                <div className="page-section">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Claims History</h2>
                            <p className="mt-2 text-sm text-slate-600">All service and manufacturer communication tied to this record.</p>
                        </div>
                        <Link to={`/warranties/${id}/file-claim`}>
                            <GlowingButton variant="secondary" className="py-3 text-sm">
                                <Plus className="w-4 h-4" />
                                Open New Claim
                            </GlowingButton>
                        </Link>
                    </div>

                    {claims.length === 0 ? (
                        <div className="page-empty">
                            <p className="text-xl font-semibold text-slate-950">No claims filed yet</p>
                            <p className="mt-2 text-sm text-slate-600">Start the first claim when this product needs support.</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {claims.map((claim) => (
                                <div key={claim.id || claim._id} className="rounded-[1.6rem] border border-slate-200 bg-[#fbfdff] p-5">
                                    <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-950">Claim #{claim.id || claim._id || 'Pending'}</h3>
                                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{getSafeFormattedDate(claim.claim_date)}</p>
                                        </div>
                                        <ClaimStatusBadge status={claim.status} />
                                    </div>

                                    <p className="text-sm leading-7 text-slate-600">{claim.issue_description || 'No issue summary was added for this claim.'}</p>

                                    <div className="mt-5 rounded-[1.25rem] border border-slate-200 bg-white p-4">
                                        <ClaimTimeline claim={claim} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoBlock = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="rounded-[1.45rem] border border-slate-200 bg-[#fbfdff] p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            {icon}
            {label}
        </div>
        <p className="mt-3 text-xl font-semibold text-slate-950">{value}</p>
    </div>
);

const SummaryCard = ({
    icon,
    label,
    value,
    helper,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    helper: string;
}) => (
    <div className="rounded-[1.45rem] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            {icon}
            {label}
        </div>
        <p className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-slate-950">{value}</p>
        <p className="mt-2 text-sm text-slate-600">{helper}</p>
    </div>
);
