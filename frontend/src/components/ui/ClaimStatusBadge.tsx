import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ClaimStatusBadgeProps {
    status?: string | null;
    className?: string;
}

/**
 * State reads from the label first and the colour second, so it survives
 * colour blindness and greyscale. The previous version carried a coloured dot
 * next to a tint of the same hue, which is two ways of saying one thing and no
 * way of saying it without colour, and pulsed an animate-ping on two of the five
 * states forever.
 */
const CONFIG: Record<string, { label: string; className: string }> = {
    pending: { label: 'Awaiting review', className: 'border-expiring bg-expiring-wash text-expiring' },
    in_progress: { label: 'In progress', className: 'border-accent bg-accent-wash text-accent' },
    approved: { label: 'Approved', className: 'border-covered bg-covered-wash text-covered' },
    completed: { label: 'Resolved', className: 'border-covered bg-covered-wash text-covered' },
    rejected: { label: 'Not approved', className: 'border-expired bg-expired-wash text-expired' },
};

const FALLBACK = { label: 'Unknown', className: 'border-rule bg-surface-raised text-neutral' };

export const ClaimStatusBadge: React.FC<ClaimStatusBadgeProps> = ({ status, className }) => {
    const { label, className: tone } = CONFIG[String(status || '').toLowerCase()] ?? FALLBACK;

    return (
        <span
            className={twMerge(
                'inline-flex items-center whitespace-nowrap rounded-control border px-2.5 py-1 text-label font-semibold',
                tone,
                className
            )}
        >
            {label}
        </span>
    );
};
