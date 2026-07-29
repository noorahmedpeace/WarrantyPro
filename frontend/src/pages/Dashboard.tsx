import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus } from 'lucide-react';
import { warrantiesApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/useToast';
import { AttentionPanel, type AttentionItem } from '../components/dashboard/AttentionPanel';
import { RecordFilters, type SortKey } from '../components/dashboard/RecordFilters';
import { RecordsTable, type RecordRow } from '../components/dashboard/RecordsTable';
import { DeleteWarrantyModal } from '../components/ui/DeleteWarrantyModal';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonRows } from '../components/ui/Skeleton';
import { formatDate } from '../lib/utils';

/**
 * This file was 1,485 lines and only one of its five sections was a dashboard.
 * The rest was a landing page bolted to the inside of the product: a marketing
 * hero, a trust-signal strip, an FAQ, and a pricing table offering Pro at $12
 * and Family at $24 for a service with no billing code anywhere in it. That
 * content either now lives on the real public site at "/" or, in the pricing
 * case, described something that cannot be bought.
 *
 * What is left is what a signed-in person came for: what needs attention, then
 * everything else.
 */

const MS_PER_DAY = 86_400_000;

const formatCurrency = (value: number) =>
    Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);

interface Derived {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    createdAt: number;
    totalMonths: number;
    remainingMonths: number;
    remainingDays: number;
    expiryLabel: string;
}

const derive = (w: Record<string, unknown>): Derived | null => {
    const id = String(w._id || w.id || '');
    if (!id) return null;

    const totalMonths = Number(w.warranty_duration_months) || 0;
    const purchase = w.purchase_date ? new Date(String(w.purchase_date)) : null;
    const valid = purchase && !Number.isNaN(purchase.getTime());

    let remainingDays = 0;
    let expiryLabel = 'Not set';

    if (valid && totalMonths > 0) {
        const expiry = new Date(purchase);
        expiry.setMonth(expiry.getMonth() + totalMonths);
        remainingDays = Math.ceil((expiry.getTime() - Date.now()) / MS_PER_DAY);
        expiryLabel = formatDate(expiry.toISOString());
    }

    return {
        id,
        name: String(w.product_name || 'Untitled record'),
        brand: String(w.brand || '-'),
        category: String(w.categoryId || 'Other'),
        price: Number(w.price) || 0,
        createdAt: w.createdAt ? new Date(String(w.createdAt)).getTime() : 0,
        totalMonths,
        remainingMonths: Math.max(0, Math.ceil(remainingDays / 30)),
        remainingDays,
        expiryLabel,
    };
};

export const Dashboard = () => {
    const { user } = useAuth();
    const toast = useToast();

    const [warranties, setWarranties] = useState<Derived[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false);

    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState<SortKey>('expiry');

    const [pendingDelete, setPendingDelete] = useState<Derived | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        warrantiesApi
            .getAll()
            .then((data) => {
                if (cancelled) return;
                setWarranties((Array.isArray(data) ? data : []).map(derive).filter(Boolean) as Derived[]);
            })
            .catch((error) => {
                if (cancelled) return;
                console.error('Failed to load warranties', error);
                setLoadFailed(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const categories = useMemo(
        () => ['All', ...Array.from(new Set(warranties.map((w) => w.category))).sort()],
        [warranties]
    );

    const attention = useMemo<AttentionItem[]>(
        () =>
            warranties
                .filter((w) => w.totalMonths > 0 && w.remainingDays <= 60)
                .sort((a, b) => a.remainingDays - b.remainingDays)
                .slice(0, 5)
                .map(({ id, name, brand, totalMonths, remainingMonths, remainingDays }) => ({
                    id,
                    name,
                    brand: brand === '-' ? undefined : brand,
                    totalMonths,
                    remainingMonths,
                    remainingDays,
                })),
        [warranties]
    );

    const rows = useMemo<RecordRow[]>(() => {
        const needle = query.trim().toLowerCase();

        const filtered = warranties.filter((w) => {
            if (category !== 'All' && w.category !== category) return false;
            if (!needle) return true;
            return w.name.toLowerCase().includes(needle) || w.brand.toLowerCase().includes(needle);
        });

        const sorted = [...filtered].sort((a, b) => {
            if (sort === 'value') return b.price - a.price;
            if (sort === 'recent') return b.createdAt - a.createdAt;
            if (sort === 'name') return a.name.localeCompare(b.name);
            return a.remainingDays - b.remainingDays;
        });

        return sorted.map((w) => ({
            id: w.id,
            name: w.name,
            brand: w.brand,
            category: w.category,
            priceLabel: w.price ? formatCurrency(w.price) : '-',
            expiryLabel: w.expiryLabel,
            totalMonths: w.totalMonths,
            remainingMonths: w.remainingMonths,
            remainingDays: w.remainingDays,
        }));
    }, [warranties, query, category, sort]);

    const handleDelete = async () => {
        if (!pendingDelete) return;
        const { id, name } = pendingDelete;

        try {
            setDeleteError(null);
            setDeletingId(id);
            await warrantiesApi.deleteOne(id);
            setWarranties((current) => current.filter((w) => w.id !== id));
            setPendingDelete(null);
            toast.success('Record deleted', `${name} and its reminders are gone.`);
        } catch (error) {
            console.error('Failed to delete warranty', error);
            setDeleteError('The record could not be deleted. Check your connection and try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const firstName = String(user?.name || '').split(' ')[0];

    return (
        <div className="page-shell">
            <header className="page-header flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="page-title">Coverage</h1>
                    <p className="page-subtitle">
                        {firstName ? `${firstName}, everything you have on file.` : 'Everything you have on file.'}
                    </p>
                </div>
                <Link to="/warranties/new" className="btn btn-solid">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add warranty
                </Link>
            </header>

            {loading ? (
                <SkeletonRows rows={4} />
            ) : loadFailed ? (
                <EmptyState
                    icon={Package}
                    title="Your records could not be loaded"
                    detail="Nothing has been lost. Refresh the page, and if it keeps happening the service is likely down."
                />
            ) : warranties.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title="Nothing on file yet"
                    detail="Add the receipt sitting in your drawer. It takes a photograph and about a minute."
                    action={
                        <Link to="/warranties/new" className="btn btn-solid">
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Add your first warranty
                        </Link>
                    }
                />
            ) : (
                <div className="grid gap-8">
                    <AttentionPanel items={attention} />

                    <section aria-labelledby="records-heading">
                        <h2 id="records-heading" className="mb-4 font-display text-heading text-ink">
                            All records
                        </h2>

                        <RecordFilters
                            query={query}
                            onQueryChange={setQuery}
                            category={category}
                            categories={categories}
                            onCategoryChange={setCategory}
                            sort={sort}
                            onSortChange={setSort}
                            resultCount={rows.length}
                        />

                        <div className="mt-5">
                            {rows.length === 0 ? (
                                <EmptyState
                                    title="No records match that"
                                    detail="Try a different search, or set the category back to All."
                                />
                            ) : (
                                <RecordsTable
                                    rows={rows}
                                    deletingId={deletingId}
                                    onDelete={(id) =>
                                        setPendingDelete(warranties.find((w) => w.id === id) ?? null)
                                    }
                                />
                            )}
                        </div>
                    </section>
                </div>
            )}

            <DeleteWarrantyModal
                open={Boolean(pendingDelete)}
                itemLabel={pendingDelete?.name}
                loading={Boolean(deletingId)}
                error={deleteError}
                onClose={() => {
                    setPendingDelete(null);
                    setDeleteError(null);
                }}
                onConfirm={handleDelete}
            />
        </div>
    );
};
