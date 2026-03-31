import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ClaimStatusBadgeProps {
    status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed';
    className?: string;
}

const statusConfig = {
    pending: {
        label: 'Pending',
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    },
    in_progress: {
        label: 'In Progress',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    approved: {
        label: 'Approved',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    rejected: {
        label: 'Rejected',
        color: 'bg-red-50 text-red-700 border-red-200',
    },
    completed: {
        label: 'Completed',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
};

export const ClaimStatusBadge: React.FC<ClaimStatusBadgeProps> = ({ status, className }) => {
    const config = statusConfig[status];

    return (
        <span
            className={twMerge(
                'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                config.color,
                className
            )}
        >
            {config.label}
        </span>
    );
};
