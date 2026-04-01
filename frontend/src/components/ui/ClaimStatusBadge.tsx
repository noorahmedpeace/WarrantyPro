import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ClaimStatusBadgeProps {
    status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed';
    className?: string;
}

const statusConfig = {
    pending: {
        label: 'Pending',
        color: 'border-amber-200 bg-amber-50 text-amber-700',
    },
    in_progress: {
        label: 'In Progress',
        color: 'border-sky-200 bg-sky-50 text-sky-700',
    },
    approved: {
        label: 'Approved',
        color: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
    rejected: {
        label: 'Rejected',
        color: 'border-red-200 bg-red-50 text-red-700',
    },
    completed: {
        label: 'Completed',
        color: 'border-emerald-200 bg-emerald-50 text-emerald-700',
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
