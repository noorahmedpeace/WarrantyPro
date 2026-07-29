import { Search } from 'lucide-react';

export type SortKey = 'expiry' | 'value' | 'recent' | 'name';

interface RecordFiltersProps {
    query: string;
    onQueryChange: (value: string) => void;
    category: string;
    categories: string[];
    onCategoryChange: (value: string) => void;
    sort: SortKey;
    onSortChange: (value: SortKey) => void;
    resultCount: number;
}

const SORTS: { value: SortKey; label: string }[] = [
    { value: 'expiry', label: 'Expiring first' },
    { value: 'value', label: 'Highest value' },
    { value: 'recent', label: 'Recently added' },
    { value: 'name', label: 'Name' },
];

/**
 * The old dashboard had two overlapping filter systems, a "portfolio view" with
 * four presets and a separate saved-view selector with four more, neither of
 * which changed anything the other could not. This is one search, one category,
 * one sort.
 */
export const RecordFilters = ({
    query,
    onQueryChange,
    category,
    categories,
    onCategoryChange,
    sort,
    onSortChange,
    resultCount,
}: RecordFiltersProps) => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
            <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral"
                aria-hidden="true"
            />
            <input
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search by product or brand"
                aria-label="Search records"
                className="field-input pl-9"
            />
        </div>

        <label className="sr-only" htmlFor="record-category">Category</label>
        <select
            id="record-category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="field-input sm:w-44"
        >
            {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
            ))}
        </select>

        <label className="sr-only" htmlFor="record-sort">Sort by</label>
        <select
            id="record-sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="field-input sm:w-44"
        >
            {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
            ))}
        </select>

        <p aria-live="polite" className="tabular shrink-0 font-mono text-data-s text-neutral">
            {resultCount} {resultCount === 1 ? 'record' : 'records'}
        </p>
    </div>
);
