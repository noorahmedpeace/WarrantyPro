import { twMerge } from 'tailwind-merge';

/**
 * Holds the shape of what is arriving. The build previously showed a centred
 * spinning ring on a blank page, so the layout moved twice: once when the
 * spinner left and again when the content arrived at a different height.
 */
export const Skeleton = ({ className }: { className?: string }) => (
    <div className={twMerge('skeleton h-4 w-full', className)} aria-hidden="true" />
);

/** The list shape used by the dashboard, claims and notifications. */
export const SkeletonRows = ({ rows = 3 }: { rows?: number }) => (
    <div className="grid gap-3" aria-busy="true" aria-label="Loading">
        {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="rounded-surface border border-rule bg-surface p-5">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="mt-3 h-1 w-full" />
                <Skeleton className="mt-3 h-3 w-40" />
            </div>
        ))}
    </div>
);
