import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CoverageMeter } from '../ui/CoverageMeter';

export interface AttentionItem {
    id: string;
    name: string;
    brand?: string;
    totalMonths: number;
    remainingMonths: number;
    remainingDays: number;
}

/**
 * The first thing on the dashboard, because it is the only part that needs
 * acting on. The previous dashboard opened with a marketing hero and put the
 * records a full screen further down, so the three items about to expire were
 * the last thing a user saw rather than the first.
 */
export const AttentionPanel = ({ items }: { items: AttentionItem[] }) => {
    if (items.length === 0) {
        return (
            <section aria-labelledby="attention-heading" className="border-b border-rule pb-8">
                <h2 id="attention-heading" className="font-display text-heading text-ink">
                    Nothing needs attention
                </h2>
                <p className="mt-2 text-body text-ink-muted">
                    Everything on file has more than 60 days of cover left.
                </p>
            </section>
        );
    }

    // The list holds anything with 60 days or fewer left, which includes records
    // whose cover has already run out. Calling all of that "expiring soon" would
    // be wrong on the ones that already expired, so the heading counts both.
    const expired = items.filter((i) => i.remainingDays < 0).length;
    const expiring = items.length - expired;

    const heading = [
        expired > 0 ? `${expired} ${expired === 1 ? 'warranty has' : 'warranties have'} expired` : null,
        expiring > 0 ? `${expiring} expiring within 60 days` : null,
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <section aria-labelledby="attention-heading" className="border-b border-rule pb-8">
            <h2 id="attention-heading" className="font-display text-heading text-ink">
                {heading}
            </h2>

            <ul className="mt-5 grid gap-4">
                {items.map((item) => (
                    <li key={item.id}>
                        <Link
                            to={`/warranties/${item.id}`}
                            className="row-interactive group flex flex-col gap-3 rounded-surface border border-rule bg-surface p-4 sm:flex-row sm:items-center sm:gap-6"
                        >
                            <div className="min-w-0 sm:w-64">
                                <p className="truncate text-label font-semibold text-ink">{item.name}</p>
                                {item.brand && (
                                    <p className="mt-0.5 truncate text-label text-neutral">{item.brand}</p>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <CoverageMeter
                                    totalMonths={item.totalMonths}
                                    remainingMonths={item.remainingMonths}
                                    remainingDays={item.remainingDays}
                                />
                            </div>

                            <ArrowRight
                                className="hidden h-4 w-4 shrink-0 text-neutral transition-colors duration-feedback group-hover:text-ink sm:block"
                                aria-hidden="true"
                            />
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
};
