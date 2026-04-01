import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { claimsApi } from '../lib/api';
import { ClaimStatusBadge } from '../components/ui/ClaimStatusBadge';
import { formatDate } from '../lib/utils';

export const ClaimsView = () => {
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadClaims = async () => {
            try {
                const data = await claimsApi.getAll();
                setClaims(data);
            } catch (error) {
                console.error('Failed to load claims', error);
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

    const activeClaims = claims.filter((claim) => claim.status !== 'completed' && claim.status !== 'rejected');
    const completedClaims = claims.filter((claim) => claim.status === 'completed' || claim.status === 'rejected');

    return (
        <div className="page-shell max-w-7xl">
            <header className="page-header">
                <h1 className="page-title">All Claims</h1>
                <p className="page-subtitle">Track every open, pending, and resolved warranty action from one view.</p>
            </header>

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
                            <p className="text-lg font-semibold text-slate-950">No active claims</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {activeClaims.map((claim) => (
                                <ClaimCard key={claim.id} claim={claim} subdued={false} />
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
                            <p className="text-lg font-semibold text-slate-950">No completed claims yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {completedClaims.map((claim) => (
                                <ClaimCard key={claim.id} claim={claim} subdued />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

const ClaimCard = ({ claim, subdued }: { claim: any; subdued: boolean }) => (
    <Link to={`/warranties/${claim.warranty_id}`} className="group block">
        <div className={`rounded-[1.6rem] border border-slate-200 p-5 transition-all duration-200 hover:-translate-y-1 ${
            subdued
                ? 'bg-[#fbfdff] opacity-80 hover:opacity-100'
                : 'bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
        }`}>
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-950">Claim #{claim.id}</h3>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{formatDate(claim.claim_date)}</p>
                </div>
                <ClaimStatusBadge status={claim.status} />
            </div>
            <p className="line-clamp-3 text-sm leading-7 text-slate-600">{claim.issue_description}</p>
        </div>
    </Link>
);
