import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle2, ClipboardList, ShieldCheck, Sparkles } from 'lucide-react';
import { claimsApi } from '../lib/api';
import { ClaimStatusBadge } from '../components/ui/ClaimStatusBadge';
import { ClaimTimeline } from '../components/ui/ClaimTimeline';
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

// The API stores claims in camelCase; older records used snake_case, so read both.
const getWarrantyLink = (claim: any) => {
    const raw = claim?.warrantyId ?? claim?.warranty_id;
    const warrantyId = isRecord(raw) ? raw._id : raw;
    return warrantyId ? `/warranties/${warrantyId}` : '/claims';
};

const getClaimIdLabel = (claim: any) => claim?.claimNumber || claim?.id || claim?._id || 'Pending';

const getClaimDescription = (claim: any) => {
    const description = claim?.issueDescription ?? claim?.issue_description;
    return typeof description === 'string' && description.trim()
        ? description
        : 'No issue description was provided for this claim yet.';
};

const getClaimWorkflowCue = (status: unknown) => {
    const normalized = String(status || '').toLowerCase();

    if (normalized === 'pending') {
        return 'Waiting for first review';
    }

    if (normalized === 'in_progress') {
        return 'Support team is actively handling this case';
    }

    if (normalized === 'completed') {
        return 'Claim completed and archived';
    }

    if (normalized === 'rejected') {
        return 'Claim closed without approval';
    }

    return 'Workflow status will update here as the case moves forward';
};

export const ClaimsView = () => {
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [queueFilter, setQueueFilter] = useState<'all' | 'attention' | 'resolved'>('all');

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

    const safeClaims = Array.isArray(claims) ? claims : [];
    const activeClaims = safeClaims.filter((claim) => claim?.status !== 'completed' && claim?.status !== 'rejected');
    const completedClaims = safeClaims.filter((claim) => claim?.status === 'completed' || claim?.status === 'rejected');
    const pendingClaims = safeClaims.filter((claim) => claim?.status === 'pending').length;
    const inProgressClaims = safeClaims.filter((claim) => claim?.status === 'in_progress').length;
    const visibleActiveClaims = queueFilter === 'resolved' ? [] : activeClaims;
    const visibleCompletedClaims = queueFilter === 'attention' ? [] : completedClaims;
    const nextPriorityLabel = pendingClaims > 0
        ? 'Start with the claims still waiting for first review.'
        : inProgressClaims > 0
            ? 'Support is already moving on active cases.'
            : 'Everything is caught up for now.';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-rule border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="page-shell max-w-7xl">
            <header className="page-header">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="page-title">All Claims</h1>
                        <p className="page-subtitle">Track every open, pending, and resolved warranty action from one view.</p>
                    </div>
                    <Link
                        to="/coverage"
                        className="row-interactive inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-4 py-2.5 text-sm font-semibold text-ink-muted hover:text-ink"
                    >
                        Dashboard
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </header>

            <div className="mb-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-surface border border-rule bg-surface px-5 py-5 shadow-raised">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-neutral">Active</p>
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-ink">{activeClaims.length}</div>
                    <p className="mt-2 text-sm text-ink-muted">Claims still moving through verification, support, or resolution.</p>
                </div>
                <div className="rounded-surface border border-rule bg-surface px-5 py-5 shadow-raised">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-neutral">Pending Review</p>
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-ink">{pendingClaims}</div>
                    <p className="mt-2 text-sm text-ink-muted">Submissions that are waiting for the first verification decision.</p>
                </div>
                <div className="rounded-surface border border-rule bg-surface px-5 py-5 shadow-raised">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-neutral">In Progress</p>
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-ink">{inProgressClaims}</div>
                    <p className="mt-2 text-sm text-ink-muted">Claims already inside the hands-on service or support workflow.</p>
                </div>
            </div>

            <div className="mb-8 rounded-surface border border-rule bg-surface px-5 py-5 shadow-raised">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-neutral">Next Move</p>
                        <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
                            {activeClaims.length > 0 ? 'Review the most urgent active claim first.' : 'Your claims workspace is calm right now.'}
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-muted">
                            {activeClaims.length > 0
                                ? 'Open the active queue to keep support requests moving while every proof and timeline stays organized.'
                                : 'When a product needs support, the claim timeline and status trail will appear here automatically.'}
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-accent bg-accent-wash px-4 py-2.5 text-sm font-semibold text-accent">
                        <ShieldCheck className="h-4 w-4" />
                        Claim-ready workspace
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                    {[
                        { key: 'all', label: `All Claims (${safeClaims.length})` },
                        { key: 'attention', label: `Needs Attention (${activeClaims.length})` },
                        { key: 'resolved', label: `Resolved (${completedClaims.length})` },
                    ].map((entry) => (
                        <button
                            key={entry.key}
                            onClick={() => setQueueFilter(entry.key as 'all' | 'attention' | 'resolved')}
                            className={`row-interactive rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                                queueFilter === entry.key
                                    ? 'border-accent bg-accent text-on-accent'
                                    : 'border-rule bg-surface text-ink-muted hover:text-ink'
                            }`}
                        >
                            {entry.label}
                        </button>
                        ))}
                </div>
            </div>

            <div className="mb-8 grid gap-4 lg:grid-cols-3">
                <div className="rounded-surface border border-rule bg-surface-raised px-5 py-5 shadow-raised lg:col-span-2">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-neutral">Workflow Priority</p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink">{nextPriorityLabel}</h2>
                    <p className="mt-3 text-sm leading-7 text-ink-muted">
                        Keep the queue moving by clearing fresh submissions first, then follow up on in-progress work until every case is either completed or closed.
                    </p>
                </div>
                <div className="rounded-surface border border-rule bg-surface px-5 py-5 shadow-raised">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-neutral">Queue health</p>
                    <div className="mt-3 space-y-3">
                        <div className="flex items-center justify-between rounded-control bg-surface-raised px-4 py-3">
                            <span className="text-sm font-medium text-ink-muted">Pending</span>
                            <span className="text-sm font-semibold text-ink">{pendingClaims}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-control bg-surface-raised px-4 py-3">
                            <span className="text-sm font-medium text-ink-muted">In Progress</span>
                            <span className="text-sm font-semibold text-ink">{inProgressClaims}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-control bg-surface-raised px-4 py-3">
                            <span className="text-sm font-medium text-ink-muted">Resolved</span>
                            <span className="text-sm font-semibold text-ink">{completedClaims.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <section className="page-section">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-full border border-accent bg-accent-wash p-2 text-accent">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                        <h2 className="text-2xl font-bold text-ink">Active Claims</h2>
                        <span className="page-chip">{visibleActiveClaims.length}</span>
                    </div>

                    {visibleActiveClaims.length === 0 ? (
                        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="page-empty">
                            <div className="empty-icon mb-5">
                                <ClipboardList className="h-7 w-7 text-neutral" />
                            </div>
                            <p className="text-lg font-semibold text-ink">
                                {queueFilter === 'resolved' ? 'Active claims are hidden in resolved mode' : 'No active claims'}
                            </p>
                            <p className="mt-2 text-sm leading-7 text-ink-muted">
                                {queueFilter === 'resolved'
                                    ? 'Switch back to All Claims or Needs Attention to review open support work.'
                                    : 'When a product needs support, your open claim workflow will appear here with status updates and next actions.'}
                            </p>
                            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Claim room standing by
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {visibleActiveClaims.map((claim) => (
                                <ClaimCard key={String(getClaimIdLabel(claim))} claim={claim} subdued={false} />
                            ))}
                        </div>
                    )}
                </section>

                <section className="page-section">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-full border border-accent bg-accent-wash p-2 text-accent">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <h2 className="text-2xl font-bold text-ink">Completed Claims</h2>
                        <span className="page-chip">{visibleCompletedClaims.length}</span>
                    </div>

                    {visibleCompletedClaims.length === 0 ? (
                        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="page-empty">
                            <div className="empty-icon mb-5">
                                <Sparkles className="h-7 w-7 text-neutral" />
                            </div>
                            <p className="text-lg font-semibold text-ink">
                                {queueFilter === 'attention' ? 'Resolved claims are hidden in attention mode' : 'No completed claims yet'}
                            </p>
                            <p className="mt-2 text-sm leading-7 text-ink-muted">
                                {queueFilter === 'attention'
                                    ? 'Switch back to All Claims or Resolved to review completed support history.'
                                    : 'Resolved and closed claim records will stay here as a clean reference history for future support work.'}
                            </p>
                            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral">
                                <CheckCircle2 className="h-3.5 w-3.5 text-covered" />
                                History will settle here
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {visibleCompletedClaims.map((claim) => (
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
        <div className={`row-interactive rounded-surface border border-rule p-5 transition-all duration-200 ${
            subdued
                ? 'bg-surface-raised opacity-80 hover:opacity-100'
                : 'bg-surface shadow-raised'
        }`}>
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-rule pb-4">
                <div>
                    <h3 className="text-lg font-semibold text-ink">Claim #{getClaimIdLabel(claim)}</h3>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-neutral">{getSafeDateLabel(claim?.claimDate ?? claim?.claim_date ?? claim?.createdAt)}</p>
                </div>
                <ClaimStatusBadge status={claim?.status} />
            </div>
            <p className="line-clamp-3 text-sm leading-7 text-ink-muted">{getClaimDescription(claim)}</p>
            <div className="mt-4 rounded-control border border-rule bg-surface-raised px-4 py-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-neutral">Workflow cue</p>
                <p className="mt-2 text-sm font-medium leading-6 text-ink-muted">{getClaimWorkflowCue(claim?.status)}</p>
            </div>
            {!subdued && (
                <div className="mt-5 rounded-surface border border-rule bg-surface px-4 py-4">
                    <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-neutral">Claim Timeline</p>
                    <ClaimTimeline claim={claim} />
                </div>
            )}
            <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral">
                Open record
                <ArrowRight className="h-3.5 w-3.5" />
            </div>
        </div>
    </Link>
);
