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

    let progressColor = 'text-primary';
    let progressBg = 'bg-slate-100';
    let strokeColor = 'stroke-primary';
    
    if (isExpired) {
        progressColor = 'text-slate-500';
        progressBg = 'bg-slate-100';
        strokeColor = 'stroke-slate-400';
    } else if (isExpiring) {
        progressColor = 'text-amber-500';
        progressBg = 'bg-amber-50';
        strokeColor = 'stroke-amber-400';
    }

    const circleLength = 2 * Math.PI * 26; // approx 163.36
    const dashOffset = circleLength - (progress / 100) * circleLength;

    return (
        <div className="trust-card p-6 flex flex-col h-full relative group hover:-translate-y-1 hover:shadow-floating cursor-pointer transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                    <div className="text-xs font-semibold text-primary mb-2 tracking-wide uppercase">{warranty.brand}</div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2 line-clamp-2">
                        {warranty.product_name}
                    </h3>
                    <div className="text-slate-500 font-medium text-sm">
                        Purchased on {formatDate(warranty.purchase_date)}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
                {/* Circular Progress Ring Mockup */}
                <div className={`relative w-16 h-16 flex flex-col items-center justify-center rounded-full ${progressBg}`}>
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="4" fill="transparent" className={`text-slate-200`} />
                        <circle 
                            cx="32" cy="32" r="26" 
                            stroke="currentColor" strokeWidth="4" 
                            fill="transparent" 
                            strokeLinecap="round" 
                            className={strokeColor} 
                            style={{ strokeDasharray: circleLength, strokeDashoffset: dashOffset }}
                        />
                    </svg>
                    <span className={`text-sm font-bold ${progressColor}`}>{Math.round(progress)}%</span>
                </div>

                <div className="flex-1">
                    {isExpiring && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-xs font-semibold mb-1 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" strokeWidth={2.5} />
                            Expiring Soon
                        </div>
                    )}
                    <div className="text-2xl font-bold text-slate-900">
                        {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(warranty.price || 0)}
                    </div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5">Est. Value</div>
                </div>
            </div>

            <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-slate-100">
                <Link to={`/warranties/${warranty._id || warranty.id}`} className="trust-button trust-button-outline w-full py-2 text-sm text-center">
                    View Details
                </Link>
                <Link to={`/claims/new?warrantyId=${warranty._id || warranty.id}`} className="trust-button trust-button-primary w-full py-2 text-sm text-center">
                    Start Claim
                </Link>
            </div>
        </div>
    );
};
