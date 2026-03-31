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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const activeClaims = claims.filter(c => c.status !== 'completed' && c.status !== 'rejected');
    const completedClaims = claims.filter(c => c.status === 'completed' || c.status === 'rejected');

    return (
        <div className="pb-24 pt-8 px-4 max-w-7xl mx-auto">
            <header className="mb-10 border-b border-slate-100 pb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">
                    All Claims
                </h1>
                <p className="text-slate-500 font-medium text-lg">
                    Track your warranty claim status
                </p>
            </header>

            <div className="space-y-12">
                {/* Active Claims */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2 tracking-tight">
                        <AlertCircle className="w-6 h-6 text-indigo-500" />
                        Active Claims <span className="text-slate-500 text-lg ml-1">({activeClaims.length})</span>
                    </h2>
                    {activeClaims.length === 0 ? (
                        <div className="neu-card bg-slate-50 border border-dashed border-slate-200 p-8 text-center text-slate-500 font-medium rounded-xl text-lg">
                            <p>No active claims</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeClaims.map((claim) => (
                                <Link key={claim.id} to={`/warranties/${claim.warranty_id}`} className="group block">
                                    <div className="neu-card bg-white p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md group-hover:-translate-y-1 h-full flex flex-col justify-between cursor-pointer rounded-2xl">
                                        <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg">Claim #{claim.id}</h3>
                                                <p className="font-semibold text-slate-500 mt-1 text-xs uppercase tracking-widest">{formatDate(claim.claim_date)}</p>
                                            </div>
                                            <ClaimStatusBadge status={claim.status} />
                                        </div>
                                        <p className="text-slate-700 font-medium line-clamp-2">{claim.issue_description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Completed Claims */}
                {completedClaims.length > 0 && (
                    <div className="pt-8 border-t border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-6 tracking-tight">
                            Completed Claims <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-0.5 text-sm font-semibold">{completedClaims.length}</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {completedClaims.map((claim) => (
                                <Link key={claim.id} to={`/warranties/${claim.warranty_id}`} className="group block opacity-75 hover:opacity-100 transition-opacity">
                                    <div className="neu-card bg-slate-50 p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md group-hover:-translate-y-1 h-full flex flex-col justify-between cursor-pointer rounded-2xl">
                                        <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-200">
                                            <div>
                                                <h3 className="font-bold text-slate-700 text-lg">Claim #{claim.id}</h3>
                                                <p className="font-semibold text-slate-500 mt-1 text-xs uppercase tracking-widest">{formatDate(claim.claim_date)}</p>
                                            </div>
                                            <ClaimStatusBadge status={claim.status} />
                                        </div>
                                        <p className="text-slate-600 font-medium line-clamp-2">{claim.issue_description}</p>
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
