import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { claimsApi } from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const activeClaims = claims.filter(c => c.status !== 'completed' && c.status !== 'rejected');
    const completedClaims = claims.filter(c => c.status === 'completed' || c.status === 'rejected');

    return (
        <div className="pb-24 pt-8 px-4 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-2">
                    All Claims
                </h1>
                <p className="text-slate-400">Track your warranty claim status</p>
            </header>

            <div className="space-y-8">
                {/* Active Claims */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="w-6 h-6 text-blue-400" />
                        Active Claims ({activeClaims.length})
                    </h2>
                    {activeClaims.length === 0 ? (
                        <GlassCard>
                            <p className="text-center text-slate-500 py-8">No active claims</p>
                        </GlassCard>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeClaims.map((claim) => (
                                <Link key={claim.id} to={`/warranties/${claim.warranty_id}`}>
                                    <GlassCard className="cursor-pointer hover:border-blue-500/30 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-bold text-white">Claim #{claim.id}</h3>
                                                <p className="text-xs text-slate-400 mt-1">{formatDate(claim.claim_date)}</p>
                                            </div>
                                            <ClaimStatusBadge status={claim.status} />
                                        </div>
                                        <p className="text-slate-300 text-sm line-clamp-2">{claim.issue_description}</p>
                                    </GlassCard>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Completed Claims */}
                {completedClaims.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Completed Claims ({completedClaims.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {completedClaims.map((claim) => (
                                <Link key={claim.id} to={`/warranties/${claim.warranty_id}`}>
                                    <GlassCard className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-bold text-white">Claim #{claim.id}</h3>
                                                <p className="text-xs text-slate-400 mt-1">{formatDate(claim.claim_date)}</p>
                                            </div>
                                            <ClaimStatusBadge status={claim.status} />
                                        </div>
                                        <p className="text-slate-300 text-sm line-clamp-2">{claim.issue_description}</p>
                                    </GlassCard>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
