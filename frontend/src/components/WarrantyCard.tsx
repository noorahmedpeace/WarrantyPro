import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { formatDate, getDaysRemaining } from '../lib/utils'; // Assumed utils exist

interface WarrantyCardProps {
    warranty: any;
    onClick?: () => void;
}

export const WarrantyCard: React.FC<WarrantyCardProps> = ({ warranty }) => {
    const daysRemaining = getDaysRemaining(
        new Date(new Date(warranty.purchase_date).setMonth(new Date(warranty.purchase_date).getMonth() + warranty.warranty_duration_months)).toISOString()
    );

    // Calculate progress
    const totalDays = warranty.warranty_duration_months * 30;
    const progress = Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100));
    const isExpiring = daysRemaining <= 30 && daysRemaining > 0;
    const isExpired = daysRemaining <= 0;

    let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (isExpired) badgeColor = 'bg-slate-100 text-slate-800 border-slate-200';
    if (isExpiring) badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';

    return (
        <div className="neu-card p-6 flex flex-col h-full bg-white bg-opacity-70 backdrop-blur-sm cursor-pointer border border-slate-200">
            <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mb-3 uppercase tracking-wider shadow-sm">{warranty.brand}</span>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight mb-1 line-clamp-2">
                        {warranty.product_name}
                    </h3>
                    <div className="text-slate-500 font-medium text-sm flex items-center gap-1.5">
                        Purchased {formatDate(warranty.purchase_date)}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-5 mb-8 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                {/* Clean Status Ring/Circle instead of block */}
                <div className={`w-14 h-14 rounded-full border-4 flex flex-col items-center justify-center text-center shadow-sm shrink-0 ${badgeColor}`}>
                    <span className="text-sm font-bold">{Math.round(progress)}%</span>
                </div>

                <div className="flex-1">
                    {isExpiring && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-semibold uppercase tracking-wider mb-2">
                            <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.5} />
                            Expiring Soon
                        </div>
                    )}
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">
                        {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(warranty.price || 0)}
                    </div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-0.5">Est. Value</div>
                </div>
            </div>

            <div className="mt-auto flex flex-col sm:flex-row gap-3">
            <div className="mt-auto flex flex-col sm:flex-row gap-3">
                <Link to={`/warranties/${warranty._id || warranty.id}`} className="neu-button-secondary w-full sm:w-1/2 py-2.5 text-sm text-center">
                    View Details
                </Link>
                <Link to={`/claims/new?warrantyId=${warranty._id || warranty.id}`} className="neu-button-primary w-full sm:w-1/2 py-2.5 text-sm text-center">
                    Start Claim
                </Link>
            </div>
        </div>
    );
};
