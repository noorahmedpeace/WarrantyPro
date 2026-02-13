import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
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

    // Circular Progress Props
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <GlassCard className="group hover:border-blue-500/30 transition-all duration-300 overflow-hidden relative">
            <div className="p-5 flex flex-col h-full relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <div className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-wider">{warranty.brand}</div>
                        <h3 className="text-lg font-bold text-white leading-tight mb-1 group-hover:text-blue-200 transition-colors">
                            {warranty.product_name}
                        </h3>
                        <div className="text-slate-400 text-xs">
                            Purchased {formatDate(warranty.purchase_date)}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    {/* Circular Progress */}
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="transform -rotate-90 w-20 h-20">
                            <circle
                                className="text-white/5"
                                strokeWidth="6"
                                stroke="currentColor"
                                fill="transparent"
                                r={radius}
                                cx="40"
                                cy="40"
                            />
                            <circle
                                className={`${isExpiring ? 'text-amber-500' : isExpired ? 'text-red-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
                                strokeWidth="6"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r={radius}
                                cx="40"
                                cy="40"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-sm font-bold text-white">{Math.round(progress)}%</span>
                        </div>
                    </div>

                    <div className="flex-1">
                        {isExpiring && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-bold mb-2">
                                <AlertTriangle className="w-3 h-3" />
                                Expiring Soon
                            </div>
                        )}
                        <div className="text-2xl font-bold text-white">
                            {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(warranty.price || 0)}
                        </div>
                        <div className="text-xs text-slate-500">Estimated Value</div>
                    </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3">
                    <Link to={`/warranties/${warranty._id || warranty.id}`} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold text-center border border-white/5 transition-colors">
                        View Details
                    </Link>
                    <Link to={`/claims/new?warrantyId=${warranty._id || warranty.id}`} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-bold text-center transition-all shadow-lg shadow-blue-500/20">
                        Start Claim
                    </Link>
                </div>
            </div>

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors duration-500" />
        </GlassCard>
    );
};
