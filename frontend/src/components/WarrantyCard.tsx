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

    let badgeColor = 'bg-accent border-dark text-dark';
    if (isExpired) badgeColor = 'bg-dark border-dark text-white';
    if (isExpiring) badgeColor = 'bg-red-400 border-dark text-dark';

    return (
        <div className="neu-card p-6 flex flex-col h-full relative group hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white cursor-pointer transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4">
                    <div className="text-sm font-black text-dark mb-2 uppercase tracking-widest border-2 border-dark inline-block px-2 bg-secondary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{warranty.brand}</div>
                    <h3 className="text-2xl font-black text-dark leading-tight mb-2 tracking-tight line-clamp-2">
                        {warranty.product_name}
                    </h3>
                    <div className="text-dark font-medium text-sm">
                        PURCHASED: {formatDate(warranty.purchase_date)}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
                {/* Blocky Progress/Status */}
                <div className={`w-16 h-16 border-4 border-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center ${badgeColor}`}>
                    <span className="text-lg font-black">{Math.round(progress)}%</span>
                    <span className="text-[10px] font-black uppercase tracking-tighter">Life</span>
                </div>

                <div className="flex-1">
                    {isExpiring && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-400 border-2 border-dark text-dark text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-2">
                            <AlertTriangle className="w-3 h-3" strokeWidth={3} />
                            Expiring Soon
                        </div>
                    )}
                    <div className="text-3xl font-black text-dark tracking-tighter">
                        {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(warranty.price || 0)}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-dark mt-1">Est. Value</div>
                </div>
            </div>

            <div className="mt-auto flex flex-col sm:flex-row gap-3">
                <Link to={`/warranties/${warranty._id || warranty.id}`} className="neu-button-secondary w-full sm:w-1/2 py-2 text-sm text-center">
                    VIEW DETAILS
                </Link>
                <Link to={`/claims/new?warrantyId=${warranty._id || warranty.id}`} className="neu-button-primary w-full sm:w-1/2 py-2 text-sm text-center">
                    START CLAIM
                </Link>
            </div>
        </div>
    );
};
