import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface ClaimStatusBadgeProps {
    status?: string | null;
    className?: string;
}

const statusConfig = {
    pending: {
        label: 'Pending',
        color: 'border-amber-200 bg-amber-50 text-amber-700',
        dot: 'bg-amber-500',
    },
    in_progress: {
        label: 'In Progress',
        color: 'border-sky-200 bg-sky-50 text-sky-700',
        dot: 'bg-sky-500',
    },
    approved: {
        label: 'Approved',
        color: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        dot: 'bg-emerald-500',
    },
    rejected: {
        label: 'Rejected',
        color: 'border-red-200 bg-red-50 text-red-700',
        dot: 'bg-red-500',
    },
    completed: {
        label: 'Completed',
        color: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        dot: 'bg-emerald-500',
    },
    unknown: {
        label: 'Unknown',
        color: 'border-slate-200 bg-slate-50 text-slate-600',
        dot: 'bg-slate-400',
    },
};

export const ClaimStatusBadge: React.FC<ClaimStatusBadgeProps> = ({ status, className }) => {
    const normalizedStatus = String(status || '').toLowerCase();
    const config = statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig.unknown;
    const animated = normalizedStatus === 'pending' || normalizedStatus === 'in_progress';

    return (
        <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={twMerge(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] shadow-[0_8px_18px_rgba(15,23,42,0.04)]',
                config.color,
                className
            )}
        >
            <span className="relative flex h-2.5 w-2.5">
                {animated && (
                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.dot}`} />
                )}
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${config.dot}`} />
            </span>
            {config.label}
        </motion.span>
    );
};
