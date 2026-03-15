import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Package, Calendar, Shield } from 'lucide-react';
import { warrantiesApi, claimsApi } from '../lib/api';
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
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin shadow-soft" />
            </div>
        );
    }

    if (!warranty) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <p className="text-slate-500 font-medium text-lg bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">Warranty not found</p>
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
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors mb-8"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </button>

            <div className="space-y-8">
                {/* Warranty Info Card */}
                <div className="trust-card p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-8 border-b border-slate-100 gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <Package className="w-8 h-8" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-primary mb-2 tracking-wide uppercase">{warranty.brand}</div>
                                <h1 className="text-3xl font-bold text-slate-900 leading-tight">{warranty.product_name}</h1>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2 border-l-2 border-slate-100 pl-6">
                            <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                                <Calendar className="w-4 h-4" />
                                Purchase Date
                            </div>
                            <p className="text-slate-900 font-bold text-xl">{formatDate(warranty.purchase_date)}</p>
                        </div>

                        <div className="space-y-2 border-l-2 border-slate-100 pl-6">
                            <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                                <Shield className="w-4 h-4" />
                                Warranty Period
                            </div>
                            <p className="text-slate-900 font-bold text-xl">{warranty.warranty_duration_months} <span className="text-sm text-slate-500 font-medium">Months</span></p>
                        </div>

                        <div className="space-y-2 border-l-2 border-slate-100 pl-6">
                            <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                                <Shield className="w-4 h-4" />
                                Status
                            </div>
                            {isExpired ? (
                                <span className="bg-red-50 text-red-700 border border-red-200 font-semibold px-2.5 py-1 rounded-md text-sm inline-block">Expired</span>
                            ) : (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2.5 py-1 rounded-md text-sm inline-block">
                                    {daysRemaining} Days Remaining
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Claims Section */}
                <div className="trust-card bg-slate-50 border-none p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <h2 className="text-2xl font-bold text-slate-900">Claims History</h2>
                        <Link to={`/warranties/${id}/file-claim`} className="trust-button trust-button-primary py-2.5">
                            <Plus className="w-5 h-5 mr-1" strokeWidth={2.5} />
                            File Claim with AI
                        </Link>
                    </div>

                    {claims.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-500 font-medium text-base mb-6">No claims filed yet.</p>
                            <Link to={`/warranties/${id}/file-claim`} className="trust-button trust-button-outline">
                                <Plus className="w-4 h-4 mr-2" />
                                File your first claim
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {claims.map((claim) => (
                                <div key={claim.id} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4 border-b border-slate-100 pb-4">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg mb-1">Claim #{claim.id.slice(0, 8)}</h3>
                                            <p className="text-sm font-medium text-slate-500">{formatDate(claim.claim_date)}</p>
                                        </div>
                                        <ClaimStatusBadge status={claim.status} />
                                    </div>

                                    <p className="text-slate-700 font-medium text-base mb-6 leading-relaxed">{claim.issue_description}</p>

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
