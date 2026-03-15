import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Package, Calendar, Shield } from 'lucide-react';
import { warrantiesApi, claimsApi } from '../lib/api';
import { GlowingButton } from '../components/ui/GlowingButton';
import { ClaimStatusBadge } from '../components/ui/ClaimStatusBadge';
import { ClaimTimeline } from '../components/ui/ClaimTimeline';
import { formatDate, getDaysRemaining } from '../lib/utils';

export const WarrantyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [warranty, setWarranty] = useState<any>(null);
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [warrantyData, claimsData] = await Promise.all([
                warrantiesApi.getOne(id!),
                claimsApi.getByWarranty(id!),
            ]);
            setWarranty(warrantyData);
            setClaims(claimsData);
        } catch (error) {
            console.error('Failed to load warranty', error);
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

    if (!warranty) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-dark font-black text-2xl uppercase border-4 border-dark bg-white p-6 shadow-neu">Warranty not found</p>
            </div>
        );
    }

    const expiryDate = new Date(warranty.purchase_date);
    expiryDate.setMonth(expiryDate.getMonth() + (warranty.warranty_duration_months || 0));
    const daysRemaining = getDaysRemaining(expiryDate.toISOString());
    const isExpired = daysRemaining < 0;

    return (
        <div className="max-w-4xl mx-auto pb-24 pt-8 px-4">
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-dark font-bold hover:bg-secondary inline-flex px-4 py-2 border-2 border-transparent hover:border-dark hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-8 transition-all uppercase"
            >
                <ArrowLeft className="w-5 h-5" strokeWidth={3} />
                Back to Dashboard
            </button>

            <div className="space-y-8">
                {/* Warranty Info Card */}
                <div className="neu-card bg-white p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-8 border-b-4 border-dark gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-accent border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center flex-shrink-0">
                                <Package className="w-10 h-10 text-dark" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="text-sm font-black text-dark mb-2 uppercase tracking-widest border-2 border-dark inline-block px-2 bg-secondary">{warranty.brand}</div>
                                <h1 className="text-4xl font-black text-dark tracking-tighter leading-none">{warranty.product_name}</h1>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2 border-l-4 border-dark pl-4">
                            <div className="flex items-center gap-2 text-dark font-black uppercase text-sm">
                                <Calendar className="w-5 h-5" strokeWidth={3} />
                                Purchase Date
                            </div>
                            <p className="text-dark font-bold text-xl">{formatDate(warranty.purchase_date)}</p>
                        </div>

                        <div className="space-y-2 border-l-4 border-dark pl-4">
                            <div className="flex items-center gap-2 text-dark font-black uppercase text-sm">
                                <Shield className="w-5 h-5" strokeWidth={3} />
                                Warranty Period
                            </div>
                            <p className="text-dark font-bold text-xl">{warranty.warranty_duration_months} <span className="text-sm">MONTHS</span></p>
                        </div>

                        <div className="space-y-2 border-l-4 border-dark pl-4">
                            <div className="flex items-center gap-2 text-dark font-black uppercase text-sm">
                                <Shield className="w-5 h-5" strokeWidth={3} />
                                Status
                            </div>
                            {isExpired ? (
                                <span className="bg-dark text-white font-black px-2 py-1 uppercase inline-block">Expired</span>
                            ) : (
                                <span className="bg-primary text-white border-2 border-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black px-3 py-1 uppercase inline-block">
                                    {daysRemaining} DAYS REMAINING
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Claims Section */}
                <div className="neu-card bg-secondary p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <h2 className="text-3xl font-black text-dark uppercase tracking-tight">Claims History</h2>
                        <Link to={`/warranties/${id}/file-claim`}>
                            <GlowingButton variant="primary" className="py-3">
                                <Plus className="w-5 h-5" strokeWidth={3} />
                                FILE CLAIM WITH AI
                            </GlowingButton>
                        </Link>
                    </div>

                    {claims.length === 0 ? (
                        <div className="text-center py-12 bg-white border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <p className="text-dark font-bold text-lg mb-6 uppercase tracking-wider">No claims filed yet</p>
                            <Link to={`/warranties/${id}/file-claim`}>
                                <GlowingButton variant="secondary" className="inline-flex">
                                    <Plus className="w-5 h-5" strokeWidth={3} />
                                    FILE YOUR FIRST CLAIM
                                </GlowingButton>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {claims.map((claim) => (
                                <div key={claim.id} className="p-6 bg-white border-4 border-dark shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
                                    <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4 border-b-2 border-dark pb-4">
                                        <div>
                                            <h3 className="font-black text-dark text-xl uppercase tracking-tight mb-1">Claim #{claim.id}</h3>
                                            <p className="text-sm font-bold text-dark bg-secondary inline-block px-2 border-2 border-dark">{formatDate(claim.claim_date)}</p>
                                        </div>
                                        <ClaimStatusBadge status={claim.status} />
                                    </div>

                                    <p className="text-dark font-bold text-lg mb-8 leading-relaxed">{claim.issue_description}</p>

                                    <div className="p-4 bg-accent border-4 border-dark rounded-none">
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
