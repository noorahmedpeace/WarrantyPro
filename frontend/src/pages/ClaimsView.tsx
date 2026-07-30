import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { claimsApi } from '../lib/api';
import { ClaimStatusBadge } from '../components/ui/ClaimStatusBadge';
import { ClaimTimeline } from '../components/ui/ClaimTimeline';
import { SkeletonRows } from '../components/ui/Skeleton';
import { formatDate } from '../lib/utils';

/**
 * The claims queue, rebuilt in the Coverage idiom: stat tiles, a segmented
 * filter, glass cards. The previous version spent three whole sections
 * narrating itself ("Next Move", "Workflow Priority", "Queue health"), none of
 * which said anything the list does not.
 */

const isRecord = (value: unknown): value is Record<string, unknown> =>
    Boolean(value) && typeof value === 'object';

const normalizeClaims = (payload: unknown): Record<string, unknown>[] => {
    const list = Array.isArray(payload)
        ? payload
        : isRecord(payload) && Array.isArray(payload.claims)
          ? payload.claims
          : [];
    return list.filter(isRecord);
};

const getWarrantyLink = (claim: Record<string, unknown>) => {
    const raw = claim.warrantyId ?? claim.warranty_id;
    const id = isRecord(raw) ? raw._id : raw;
    return id ? `/warranties/${id}` : '/claims';
};

const getRef = (claim: Record<string, unknown>) =>
    String(claim.claimNumber || claim._id || claim.id || 'PENDING');

const getDescription = (claim: Record<string, unknown>) => {
    const d = claim.issueDescription ?? claim.issue_description;
    return typeof d === 'string' && d.trim() ? d : 'No issue description was recorded.';
};

const getDateLabel = (claim: Record<string, unknown>) => {
    const raw = claim.claimDate ?? claim.claim_date ?? claim.createdAt;
    if (!raw) return 'date pending';
    const date = new Date(String(raw));
    return Number.isNaN(date.getTime()) ? 'date pending' : formatDate(date.toISOString());
};

const isResolved = (claim: Record<string, unknown>) =>
    claim.status === 'completed' || claim.status === 'rejected';

type Filter = 'all' | 'active' | 'resolved';

export const ClaimsView = () => {
    const [claims, setClaims] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>('all');

    useEffect(() => {
        let cancelled = false;
        claimsApi
            .getAll()
            .then((data) => !cancelled && setClaims(normalizeClaims(data)))
            .catch((error) => {
                console.error('Failed to load claims', error);
                if (!cancelled) setClaims([]);
            })
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, []);

    const active = claims.filter((c) => !isResolved(c));
    const resolved = claims.filter(isResolved);
    const awaiting = claims.filter((c) => c.status === 'pending').length;

    const visible = filter === 'active' ? active : filter === 'resolved' ? resolved : claims;

    const FILTERS: { key: Filter; label: string; count: number }[] = [
        { key: 'all', label: 'All', count: claims.length },
        { key: 'active', label: 'Active', count: active.length },
        { key: 'resolved', label: 'Resolved', count: resolved.length },
    ];

    return (
        <div className="page-shell max-w-7xl">
            <header className="page-header">
                <h1 className="page-title">Claims</h1>
                <p className="page-subtitle">Every case, and where it stands.</p>
            </header>

            {loading ? (
                <SkeletonRows rows={3} />
            ) : claims.length === 0 ? (
                <div className="glass-card glow-accent px-6 py-14 text-center sm:py-16">
                    {/* A miniature of what a claim becomes: the drafted letter. */}
                    <div
                        aria-hidden="true"
                        className="mx-auto w-[240px] rotate-[-2deg] bg-[#FCFAF4] px-4 py-3.5 text-left font-mono text-[10px] leading-[1.8] text-[#4A5248] shadow-overlay"
                    >
                        <p>
                            <span className="text-[#7C8578]">To: </span>support@sony.com
                        </p>
                        <p className="text-[#20222E]">
                            <span className="text-[#7C8578]">Subject: </span>Warranty claim
                        </p>
                        <p className="mt-1.5 border-t border-dashed border-[#E5E1D4] pt-1.5">
                            Dear Support Team, I am writing to claim under warranty for...
                        </p>
                    </div>

                    <h2 className="mt-8 font-display text-[1.6rem] font-semibold tracking-[-0.02em] text-ink">
                        No claims yet. May it stay that way.
                    </h2>
                    <p className="mx-auto mt-2 max-w-[46ch] text-body text-ink-muted">
                        When something breaks, open the product's record and the letter above
                        writes itself, dates filled in.
                    </p>
                    <Link to="/coverage" className="btn btn-solid mt-7">
                        Go to your records
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>
            ) : (
                <div className="grid gap-8">
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Active', value: active.length },
                            { label: 'Awaiting review', value: awaiting },
                            { label: 'Resolved', value: resolved.length },
                        ].map(({ label, value }) => (
                            <div key={label} className="glass-card px-4 py-4 sm:px-5">
                                <p className="text-caption font-semibold uppercase text-neutral">{label}</p>
                                <p className="tabular mt-2 font-mono text-[1.5rem] font-semibold leading-none tracking-[-0.02em] text-ink sm:text-[1.8rem]">
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div>
                        <div
                            role="radiogroup"
                            aria-label="Filter claims"
                            className="inline-flex rounded-control border border-rule bg-surface p-0.5"
                        >
                            {FILTERS.map(({ key, label, count }) => (
                                <button
                                    key={key}
                                    role="radio"
                                    aria-checked={filter === key}
                                    onClick={() => setFilter(key)}
                                    className={`rounded-[4px] px-3.5 py-1.5 text-label font-semibold transition-colors duration-feedback ${
                                        filter === key
                                            ? 'bg-surface-raised text-ink'
                                            : 'text-neutral hover:text-ink'
                                    }`}
                                >
                                    {label}
                                    <span className="tabular ml-1.5 font-mono text-[0.7rem] text-neutral">
                                        {count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {visible.length === 0 ? (
                            <p className="mt-6 text-body text-ink-muted">
                                Nothing under this filter. Switch back to All.
                            </p>
                        ) : (
                            <div className="mt-5 grid gap-4 lg:grid-cols-2">
                                {visible.map((claim) => {
                                    const done = isResolved(claim);
                                    return (
                                        <Link
                                            key={getRef(claim)}
                                            to={getWarrantyLink(claim)}
                                            className={`glass-card group flex flex-col p-5 transition-[transform,border-color,opacity] duration-enter ease-enter hover:-translate-y-0.5 hover:border-white/[0.16] ${
                                                done ? 'opacity-70 hover:opacity-100' : ''
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4 border-b border-rule pb-4">
                                                <div className="min-w-0">
                                                    <p className="tabular truncate font-mono text-data-s text-neutral">
                                                        {getRef(claim)}
                                                    </p>
                                                    <p className="mt-1 text-label text-neutral">
                                                        {getDateLabel(claim)}
                                                    </p>
                                                </div>
                                                <ClaimStatusBadge status={String(claim.status ?? '')} />
                                            </div>

                                            <p className="mt-4 line-clamp-2 text-body text-ink-muted">
                                                {getDescription(claim)}
                                            </p>

                                            {!done && (
                                                <div className="mt-4 rounded-control border border-rule bg-paper/40 px-4 py-4">
                                                    <ClaimTimeline claim={claim} />
                                                </div>
                                            )}

                                            <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-label font-semibold text-accent">
                                                Open record
                                                <ArrowRight
                                                    className="h-3.5 w-3.5 transition-transform duration-feedback group-hover:translate-x-0.5"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
