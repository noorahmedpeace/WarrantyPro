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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!warranty) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500 font-semibold text-xl bg-white p-6 shadow-sm rounded-xl border border-slate-200">Warranty not found</p>
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
                className="flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-800 mb-8 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
            </button>

            <div className="space-y-8">
                {/* Warranty Info Card */}
                <div className="neu-card bg-white p-6 md:p-8 shadow-sm border border-slate-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-8 border-b border-slate-100 gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
                                <Package className="w-10 h-10 text-indigo-500" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-widest bg-indigo-50 inline-block px-3 py-1 rounded-full">{warranty.brand}</div>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">{warranty.product_name}</h1>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2 border-l-2 border-slate-100 pl-4">
                            <div className="flex items-center gap-2 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                                <Calendar className="w-4 h-4" />
                                Purchase Date
                            </div>
                            <p className="text-slate-900 font-bold text-xl">{formatDate(warranty.purchase_date)}</p>
                        </div>

                        <div className="space-y-2 border-l-2 border-slate-100 pl-4">
                            <div className="flex items-center gap-2 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                                <Shield className="w-4 h-4" />
                                Warranty Period
                            </div>
                            <p className="text-slate-900 font-bold text-xl">{warranty.warranty_duration_months} <span className="text-xs text-slate-500 uppercase">MONTHS</span></p>
                        </div>

                        <div className="space-y-2 border-l-2 border-slate-100 pl-4">
                            <div className="flex items-center gap-2 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                                <Shield className="w-4 h-4" />
                                Status
                            </div>
                            {isExpired ? (
                                <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full text-xs uppercase inline-block">Expired</span>
                            ) : (
                                <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full text-xs uppercase inline-block">
                                    {daysRemaining} DAYS REMAINING
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Claims Section */}
                <div className="neu-card bg-white shadow-sm border border-slate-200 p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Claims History</h2>
                        <Link to={`/warranties/${id}/file-claim`}>
                            <GlowingButton variant="primary" className="py-2.5 text-sm">
                                <Plus className="w-4 h-4" />
                                File Claim with AI
                            </GlowingButton>
                        </Link>
                    </div>

                    {claims.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-500 font-medium text-base mb-6">No claims filed yet</p>
                            <Link to={`/warranties/${id}/file-claim`}>
                                <GlowingButton variant="secondary" className="inline-flex py-2.5 text-sm">
                                    <Plus className="w-4 h-4 mr-1.5" />
                                    File Your First Claim
                                </GlowingButton>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {claims.map((claim) => (
                                <div key={claim.id} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4 border-b border-slate-100 pb-4">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg tracking-tight mb-1">Claim #{claim.id}</h3>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{formatDate(claim.claim_date)}</p>
                                        </div>
                                        <ClaimStatusBadge status={claim.status} />
                                    </div>

                                    <p className="text-slate-700 font-medium text-base mb-8 leading-relaxed max-w-2xl">{claim.issue_description}</p>

                                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
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
