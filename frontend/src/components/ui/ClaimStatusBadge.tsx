import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ClaimStatusBadgeProps {
    status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed';
    className?: string;
}

const statusConfig = {
    pending: {
        label: 'Pending',
        color: 'border-amber-300/20 bg-amber-500/10 text-amber-200',
    },
    in_progress: {
        label: 'In Progress',
        color: 'border-sky-300/20 bg-sky-500/10 text-sky-200',
    },
    approved: {
        label: 'Approved',
        color: 'border-emerald-300/20 bg-emerald-500/10 text-emerald-200',
    },
    rejected: {
        label: 'Rejected',
        color: 'border-red-300/20 bg-red-500/10 text-red-200',
    },
    completed: {
        label: 'Completed',
        color: 'border-emerald-300/20 bg-emerald-500/10 text-emerald-200',
    },
};

export const ClaimStatusBadge: React.FC<ClaimStatusBadgeProps> = ({ status, className }) => {
    const config = statusConfig[status];

    return (
        <span
            className={twMerge(
                'inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.22em] border',
                config.color,
                className
            )}
        >
            {config.label}
        </span>
    );
};
