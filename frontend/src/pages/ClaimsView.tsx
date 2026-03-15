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
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-dark border-t-primary rounded-none animate-spin shadow-neu" />
            </div>
        );
    }

    const activeClaims = claims.filter(c => c.status !== 'completed' && c.status !== 'rejected');
    const completedClaims = claims.filter(c => c.status === 'completed' || c.status === 'rejected');

    return (
        <div className="pb-24 pt-8 px-4 max-w-7xl mx-auto">
            <header className="mb-10 border-b-4 border-dark pb-6">
                <h1 className="text-4xl md:text-5xl font-black text-dark uppercase tracking-tighter mb-2">
                    All Claims
                </h1>
                <p className="text-dark font-bold text-lg inline-block bg-secondary px-2 border-2 border-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    Track your warranty claim status
                </p>
            </header>

            <div className="space-y-12">
                {/* Active Claims */}
                <div>
                    <h2 className="text-3xl font-black text-dark uppercase mb-6 flex items-center gap-3 tracking-tight">
                        <AlertCircle className="w-8 h-8 text-primary" strokeWidth={3} />
                        Active Claims <span className="text-primary">({activeClaims.length})</span>
                    </h2>
                    {activeClaims.length === 0 ? (
                        <div className="neu-card bg-white p-8 text-center text-dark font-bold uppercase tracking-wider text-xl">
                            <p>No active claims</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeClaims.map((claim) => (
                                <Link key={claim.id} to={`/warranties/${claim.warranty_id}`} className="group block">
                                    <div className="neu-card bg-white p-6 transition-transform group-hover:-translate-y-1 h-full flex flex-col justify-between cursor-pointer">
                                        <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-dark">
                                            <div>
                                                <h3 className="font-black text-dark text-xl uppercase">Claim #{claim.id}</h3>
                                                <p className="font-bold text-dark mt-2 bg-secondary inline-block px-2 border-2 border-dark text-sm">{formatDate(claim.claim_date)}</p>
                                            </div>
                                            <ClaimStatusBadge status={claim.status} />
                                        </div>
                                        <p className="text-dark font-bold line-clamp-2">{claim.issue_description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Completed Claims */}
                {completedClaims.length > 0 && (
                    <div className="pt-8 border-t-4 border-dark">
                        <h2 className="text-3xl font-black text-dark uppercase mb-6 tracking-tight">
                            Completed Claims <span className="bg-dark text-white px-2 py-1 text-2xl">{completedClaims.length}</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {completedClaims.map((claim) => (
                                <Link key={claim.id} to={`/warranties/${claim.warranty_id}`} className="group block">
                                    <div className="neu-card bg-slate-200 p-6 transition-transform group-hover:-translate-y-1 grayscale hover:grayscale-0 h-full flex flex-col justify-between cursor-pointer">
                                        <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-dark">
                                            <div>
                                                <h3 className="font-black text-dark text-xl uppercase">Claim #{claim.id}</h3>
                                                <p className="font-bold text-dark mt-2 bg-white inline-block px-2 border-2 border-dark text-sm">{formatDate(claim.claim_date)}</p>
                                            </div>
                                            <ClaimStatusBadge status={claim.status} />
                                        </div>
                                        <p className="text-dark font-bold line-clamp-2 opacity-80">{claim.issue_description}</p>
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
