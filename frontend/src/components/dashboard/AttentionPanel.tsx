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
 * acting on. Rows are glass with the days figure as the loudest element,
 * coloured by state, because "how long" is the entire question this panel
 * answers.
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

            <ul className="mt-5 grid gap-3">
                {items.map((item) => {
                    const gone = item.remainingDays < 0;
                    return (
                        <li key={item.id}>
                            <Link
                                to={`/warranties/${item.id}`}
                                className="glass-card group flex flex-col gap-3 p-4 transition-[transform,border-color] duration-enter ease-enter hover:-translate-y-0.5 hover:border-white/[0.16] sm:flex-row sm:items-center sm:gap-6 sm:px-5"
                            >
                                <div className="min-w-0 sm:w-60">
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
                                        showLabel={false}
                                    />
                                </div>

                                <p
                                    className={`tabular shrink-0 font-mono text-[1.4rem] font-semibold leading-none tracking-[-0.02em] sm:text-right sm:text-[1.6rem] ${
                                        gone ? 'text-expired' : 'text-expiring'
                                    }`}
                                >
                                    {gone ? 'expired' : `${item.remainingDays}d`}
                                    {!gone && (
                                        <span className="ml-1.5 text-[0.8rem] font-medium text-neutral">left</span>
                                    )}
                                </p>

                                <ArrowRight
                                    className="hidden h-4 w-4 shrink-0 text-neutral transition-colors duration-feedback group-hover:text-ink sm:block"
                                    aria-hidden="true"
                                />
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};
