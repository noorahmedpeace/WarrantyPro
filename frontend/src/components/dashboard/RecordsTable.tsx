import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { CoverageMeter } from '../ui/CoverageMeter';

export interface RecordRow {
    id: string;
    name: string;
    brand: string;
    category: string;
    priceLabel: string;
    expiryLabel: string;
    totalMonths: number;
    remainingMonths: number;
    remainingDays: number;
}

interface RecordsTableProps {
    rows: RecordRow[];
    onDelete: (id: string) => void;
    deletingId?: string | null;
}

/**
 * Rows, not cards. The previous dashboard wrapped every warranty in a floating
 * card with a 50px shadow and a hover lift, which is a lot of elevation for a
 * list where nothing is above anything else. A hairline does the separating.
 *
 * Table on desktop so the figures line up in columns; stacked blocks on mobile,
 * where a four-column table is unreadable and the meter is the thing worth
 * seeing at arm's length.
 */
export const RecordsTable = ({ rows, onDelete, deletingId }: RecordsTableProps) => (
    <>
        {/* Desktop */}
        <div className="glass-card hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-rule bg-surface-raised/60">
                        {['Product', 'Brand', 'Cover remaining', 'Expires', 'Value', ''].map((h, i) => (
                            <th
                                key={h || i}
                                scope="col"
                                className={i === 0 ? 'py-3 pl-5 pr-4 text-caption font-semibold uppercase text-neutral' : 'py-3 pr-4 text-caption font-semibold uppercase text-neutral'}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id} className="border-b border-rule transition-colors duration-feedback last:border-0 hover:bg-white/[0.03]">
                            <td className="py-3.5 pl-5 pr-4">
                                <Link
                                    to={`/warranties/${row.id}`}
                                    className="text-label font-semibold text-ink hover:text-accent-pressed"
                                >
                                    {row.name}
                                </Link>
                                <p className="mt-0.5 text-caption uppercase text-neutral-soft">{row.category}</p>
                            </td>
                            <td className="py-3 pr-4 text-label text-ink-muted">{row.brand}</td>
                            <td className="w-64 py-3 pr-4">
                                <CoverageMeter
                                    totalMonths={row.totalMonths}
                                    remainingMonths={row.remainingMonths}
                                    remainingDays={row.remainingDays}
                                    size="sm"
                                />
                            </td>
                            <td className="tabular py-3 pr-4 font-mono text-data-s text-ink-muted">
                                {row.expiryLabel}
                            </td>
                            <td className="tabular py-3 pr-4 font-mono text-data-s text-ink-muted">
                                {row.priceLabel}
                            </td>
                            <td className="py-3">
                                <button
                                    type="button"
                                    onClick={() => onDelete(row.id)}
                                    disabled={deletingId === row.id}
                                    aria-label={`Delete ${row.name}`}
                                    className="rounded-control p-1.5 text-neutral transition-colors duration-feedback hover:bg-expired-wash hover:text-expired disabled:opacity-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Mobile */}
        <ul className="grid gap-3 md:hidden">
            {rows.map((row) => (
                <li key={row.id} className="glass-card p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <Link
                                to={`/warranties/${row.id}`}
                                className="block truncate text-label font-semibold text-ink"
                            >
                                {row.name}
                            </Link>
                            <p className="mt-0.5 truncate text-label text-neutral">
                                {row.brand} · expires {row.expiryLabel}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onDelete(row.id)}
                            disabled={deletingId === row.id}
                            aria-label={`Delete ${row.name}`}
                            className="-mr-1 -mt-1 shrink-0 rounded-control p-2 text-neutral hover:bg-expired-wash hover:text-expired disabled:opacity-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="mt-3">
                        <CoverageMeter
                            totalMonths={row.totalMonths}
                            remainingMonths={row.remainingMonths}
                            remainingDays={row.remainingDays}
                        />
                    </div>
                </li>
            ))}
        </ul>
    </>
);
