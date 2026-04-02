import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, ClipboardList, ShieldCheck, Sparkles } from 'lucide-react';
import { claimsApi } from '../lib/api';
import { ClaimStatusBadge } from '../components/ui/ClaimStatusBadge';
import { formatDate } from '../lib/utils';

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object';

const toClaimList = (value: unknown): unknown[] => {
    if (Array.isArray(value)) {
        return value;
    }

    if (!isRecord(value)) {
        return [];
    }

    if (Array.isArray(value.claims)) {
        return value.claims;
    }

    if (isRecord(value.data) && Array.isArray(value.data.claims)) {
        return value.data.claims;
    }

    if (Array.isArray(value.data)) {
        return value.data;
    }

    return [];
};

const normalizeClaims = (payload: unknown): any[] =>
    toClaimList(payload).filter((claim): claim is Record<string, unknown> => isRecord(claim));

const getSafeDateLabel = (value: unknown) => {
    if (!value) {
        return 'Date pending';
    }

    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
        return 'Date pending';
    }

    return formatDate(date.toISOString());
};

const getWarrantyLink = (claim: any) => {
    const warrantyId = isRecord(claim?.warranty_id) ? claim.warranty_id?._id : claim?.warranty_id;
    return warrantyId ? `/warranties/${warrantyId}` : '/claims';
};

const getClaimIdLabel = (claim: any) => claim?.id || claim?._id || 'Pending';

const getClaimDescription = (claim: any) =>
    typeof claim?.issue_description === 'string' && claim.issue_description.trim()
        ? claim.issue_description
        : 'No issue description was provided for this claim yet.';

export const ClaimsView = () => {
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadClaims = async () => {
            try {
                const data = await claimsApi.getAll();
                setClaims(normalizeClaims(data));
            } catch (error) {
                console.error('Failed to load claims', error);
                setClaims([]);
            } finally {
                setLoading(false);
            }
        };

        loadClaims();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
            </div>
        );
    }

    const safeClaims = Array.isArray(claims) ? claims : [];
    const activeClaims = safeClaims.filter((claim) => claim?.status !== 'completed' && claim?.status !== 'rejected');
    const completedClaims = safeClaims.filter((claim) => claim?.status === 'completed' || claim?.status === 'rejected');
    const pendingClaims = safeClaims.filter((claim) => claim?.status === 'pending').length;
    const inProgressClaims = safeClaims.filter((claim) => claim?.status === 'in_progress').length;

    return (
        <div className="page-shell max-w-7xl">
            <header className="page-header">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="page-title">All Claims</h1>
                        <p className="page-subtitle">Track every open, pending, and resolved warranty action from one view.</p>
                    </div>
                    <Link
                        to="/"
                        className="micro-lift inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-950"
                    >
                        Dashboard
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </header>

            <div className="mb-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-slate-400">Active</p>
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950">{activeClaims.length}</div>
                    <p className="mt-2 text-sm text-slate-600">Claims still moving through verification, support, or resolution.</p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-slate-400">Pending Review</p>
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950">{pendingClaims}</div>
                    <p className="mt-2 text-sm text-slate-600">Submissions that are waiting for the first verification decision.</p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-slate-400">In Progress</p>
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950">{inProgressClaims}</div>
                    <p className="mt-2 text-sm text-slate-600">Claims already inside the hands-on service or support workflow.</p>
                </div>
            </div>

            <div className="mb-8 rounded-[1.6rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-slate-400">Next Move</p>
                        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                            {activeClaims.length > 0 ? 'Review the most urgent active claim first.' : 'Your claims workspace is calm right now.'}
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                            {activeClaims.length > 0
                                ? 'Open the active queue to keep support requests moving while every proof and timeline stays organized.'
                                : 'When a product needs support, the claim timeline and status trail will appear here automatically.'}
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700">
                        <ShieldCheck className="h-4 w-4" />
                        Claim-ready workspace
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <section className="page-section">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-full border border-sky-200 bg-sky-50 p-2 text-sky-600">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-950">Active Claims</h2>
                        <span className="page-chip">{activeClaims.length}</span>
                    </div>

                    {activeClaims.length === 0 ? (
                        <div className="page-empty">
                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-[#f8fafc]">
                                <ClipboardList className="h-7 w-7 text-slate-400" />
                            </div>
                            <p className="text-lg font-semibold text-slate-950">No active claims</p>
                            <p className="mt-2 text-sm leading-7 text-slate-600">
                                When a product needs support, your open claim workflow will appear here with status updates and next actions.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {activeClaims.map((claim) => (
                                <ClaimCard key={String(getClaimIdLabel(claim))} claim={claim} subdued={false} />
                            ))}
                        </div>
                    )}
                </section>

                <section className="page-section">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-full border border-sky-200 bg-sky-50 p-2 text-sky-600">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-950">Completed Claims</h2>
                        <span className="page-chip">{completedClaims.length}</span>
                    </div>

                    {completedClaims.length === 0 ? (
                        <div className="page-empty">
                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-[#f8fafc]">
                                <Sparkles className="h-7 w-7 text-slate-400" />
                            </div>
                            <p className="text-lg font-semibold text-slate-950">No completed claims yet</p>
                            <p className="mt-2 text-sm leading-7 text-slate-600">
                                Resolved and closed claim records will stay here as a clean reference history for future support work.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {completedClaims.map((claim) => (
                                <ClaimCard key={String(getClaimIdLabel(claim))} claim={claim} subdued />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

const ClaimCard = ({ claim, subdued }: { claim: any; subdued: boolean }) => (
    <Link to={getWarrantyLink(claim)} className="group block">
        <div className={`micro-lift rounded-[1.6rem] border border-slate-200 p-5 transition-all duration-200 ${
            subdued
                ? 'bg-[#fbfdff] opacity-80 hover:opacity-100'
                : 'bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
        }`}>
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-950">Claim #{getClaimIdLabel(claim)}</h3>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{getSafeDateLabel(claim?.claim_date)}</p>
                </div>
                <ClaimStatusBadge status={claim?.status} />
            </div>
            <p className="line-clamp-3 text-sm leading-7 text-slate-600">{getClaimDescription(claim)}</p>
            <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Open record
                <ArrowRight className="h-3.5 w-3.5" />
            </div>
        </div>
    </Link>
);
