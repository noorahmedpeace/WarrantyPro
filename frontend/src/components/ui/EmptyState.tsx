import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    /** One sentence. What is not here, in the user's words. */
    title: string;
    /** One sentence. Why it is empty, or what fills it. Optional. */
    detail?: string;
    /** At most one. An empty state with three choices is a menu. */
    action?: React.ReactNode;
}

/**
 * Replaces the old markup, which paired a breathing radial-gradient orb with a
 * shimmer sweep, both on infinite loops, and a two-paragraph explanation. An
 * empty state is not an event and does not need to be sold.
 */
export const EmptyState = ({ icon: Icon, title, detail, action }: EmptyStateProps) => (
    <div className="page-empty">
        {Icon && (
            <div className="empty-icon">
                <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            </div>
        )}
        <p className="mt-4 text-heading text-ink">{title}</p>
        {detail && <p className="mx-auto mt-2 max-w-[46ch] text-body text-ink-muted">{detail}</p>}
        {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
);
