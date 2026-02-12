import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ClaimStatusBadgeProps {
    status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed';
    className?: string;
}

const statusConfig = {
    pending: {
        label: 'Pending',
        color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },
    in_progress: {
        label: 'In Progress',
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    approved: {
        label: 'Approved',
        color: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
    rejected: {
        label: 'Rejected',
        color: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
    completed: {
        label: 'Completed',
        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
};

export const ClaimStatusBadge: React.FC<ClaimStatusBadgeProps> = ({ status, className }) => {
    const config = statusConfig[status];

    return (
        <span
            className={twMerge(
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border',
                config.color,
                className
            )}
        >
            {config.label}
        </span>
    );
};
