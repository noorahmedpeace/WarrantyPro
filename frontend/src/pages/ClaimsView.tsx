import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { claimsApi } from '../lib/api';
import { ClaimStatusBadge } from '../components/ui/ClaimStatusBadge';
import { formatDate } from '../lib/utils';

export const ClaimsView = () => {
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClaims();
    }, []);

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

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin shadow-soft" />
            </div>
        );
    }

    const activeClaims = claims.filter(c => c.status !== 'completed' && c.status !== 'rejected');
    const completedClaims = claims.filter(c => c.status === 'completed' || c.status === 'rejected');

    return (
        <div className="pb-24 pt-8 px-4 max-w-7xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                    All Claims
                </h1>
                <p className="text-slate-600 font-medium text-lg">
                    Track your warranty claim status
                </p>
            </header>

            <div className="space-y-12">
                {/* Active Claims */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-primary" strokeWidth={2.5} />
                        Active Claims <span className="text-primary bg-blue-50 px-2 py-0.5 rounded-md text-xl">({activeClaims.length})</span>
                    </h2>
                    {activeClaims.length === 0 ? (
                        <div className="trust-card p-12 text-center text-slate-500 font-medium text-lg border border-dashed border-slate-300">
                            <p>No active claims</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeClaims.map((claim) => (
                                <Link key={claim.id} to={`/warranties/${claim.warranty_id}`} className="group block">
                                    <div className="trust-card bg-white p-6 transition-all hover:shadow-floating hover:-translate-y-1 h-full flex flex-col justify-between cursor-pointer">
                                        <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg">Claim #{claim.id.slice(0, 8)}</h3>
                                                <p className="font-medium text-slate-500 mt-1 text-sm">{formatDate(claim.claim_date)}</p>
                                            </div>
                                            <ClaimStatusBadge status={claim.status} />
                                        </div>
                                        <p className="text-slate-700 font-medium line-clamp-2 leading-relaxed">{claim.issue_description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Completed Claims */}
                {completedClaims.length > 0 && (
                    <div className="pt-10 border-t border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            Completed Claims <span className="bg-slate-100 text-slate-600 px-3 py-0.5 rounded-full text-lg">{completedClaims.length}</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {completedClaims.map((claim) => (
                                <Link key={claim.id} to={`/warranties/${claim.warranty_id}`} className="group block">
                                    <div className="trust-card bg-slate-50 p-6 transition-all hover:-translate-y-1 h-full flex flex-col justify-between cursor-pointer border border-slate-100 opacity-80 hover:opacity-100">
                                        <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-200/60">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg">Claim #{claim.id.slice(0, 8)}</h3>
                                                <p className="font-medium text-slate-500 mt-1 text-sm">{formatDate(claim.claim_date)}</p>
                                            </div>
                                            <ClaimStatusBadge status={claim.status} />
                                        </div>
                                        <p className="text-slate-600 font-medium line-clamp-2 leading-relaxed">{claim.issue_description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
