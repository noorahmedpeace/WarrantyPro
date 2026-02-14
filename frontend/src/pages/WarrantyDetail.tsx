import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Package, Calendar, Shield } from 'lucide-react';
import { warrantiesApi, claimsApi } from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!warranty) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-400">Warranty not found</p>
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
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
            </button>

            <div className="space-y-6">
                {/* Warranty Info Card */}
                <GlassCard>
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Package className="w-8 h-8 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">{warranty.product_name}</h1>
                                <p className="text-slate-400">{warranty.brand}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Calendar className="w-4 h-4" />
                                Purchase Date
                            </div>
                            <p className="text-white font-bold">{formatDate(warranty.purchase_date)}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Shield className="w-4 h-4" />
                                Warranty Period
                            </div>
                            <p className="text-white font-bold">{warranty.warranty_duration_months} months</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Shield className="w-4 h-4" />
                                Status
                            </div>
                            {isExpired ? (
                                <span className="text-red-400 font-bold">Expired</span>
                            ) : (
                                <span className="text-green-400 font-bold">{daysRemaining} days remaining</span>
                            )}
                        </div>
                    </div>
                </GlassCard>

                {/* Claims Section */}
                <GlassCard>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Claims History</h2>
                        <Link to={`/warranties/${id}/file-claim`}>
                            <GlowingButton>
                                <Plus className="w-5 h-5" />
                                File Claim with AI
                            </GlowingButton>
                        </Link>
                    </div>

                    {claims.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500 mb-4">No claims filed yet</p>
                            <Link to={`/warranties/${id}/file-claim`}>
                                <GlowingButton variant="secondary">
                                    <Plus className="w-5 h-5" />
                                    File Your First Claim
                                </GlowingButton>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {claims.map((claim) => (
                                <div key={claim.id} className="p-6 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-bold text-white mb-1">Claim #{claim.id}</h3>
                                            <p className="text-sm text-slate-400">{formatDate(claim.claim_date)}</p>
                                        </div>
                                        <ClaimStatusBadge status={claim.status} />
                                    </div>

                                    <p className="text-slate-300 mb-6">{claim.issue_description}</p>

                                    <ClaimTimeline claim={claim} />
                                </div>
                            ))}
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};
