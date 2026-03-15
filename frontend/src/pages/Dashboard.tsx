import { useEffect, useState, useMemo } from 'react';
import { ShieldCheck, TrendingUp, Plus, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { warrantiesApi } from '../lib/api';
import { GlowingButton } from '../components/ui/GlowingButton';
import { CategoryFilter } from '../components/CategoryFilter';
import { WarrantyCard } from '../components/WarrantyCard';
import { getDaysRemaining } from '../lib/utils';

export const Dashboard = () => {
    const [warranties, setWarranties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All Items');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await warrantiesApi.getAll();
            setWarranties(data);
        } catch (error) {
            console.error('Failed to load warranties', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculations
    const totalValue = useMemo(() => warranties.reduce((acc, curr) => acc + (curr.price || 0), 0), [warranties]);

    // Mock savings calculation
    const totalSavings = useMemo(() => Math.round(totalValue * 0.15), [totalValue]);

    const expiringSoonCount = useMemo(() => warranties.filter(w => {
        if (!w.purchase_date) return false;
        const expiryDate = new Date(new Date(w.purchase_date).setMonth(new Date(w.purchase_date).getMonth() + w.warranty_duration_months));
        const days = getDaysRemaining(expiryDate.toISOString());
        return days > 0 && days <= 30;
    }).length, [warranties]);

    const protectionStatus = expiringSoonCount > 2 ? 'AT RISK' : expiringSoonCount > 0 ? 'NEEDS ATTENTION' : 'EXCELLENT';

    // Categories
    const categories = ['All Items', ...Array.from(new Set(warranties.map(w => w.categoryId || 'Other'))).filter(c => c)];

    // Filter
    const filteredWarranties = selectedCategory === 'All Items'
        ? warranties
        : warranties.filter(w => w.categoryId === selectedCategory);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-dark border-t-primary rounded-none animate-spin shadow-neu" />
            </div>
        );
    }

    return (
        <div className="pb-32 pt-8 px-4 max-w-7xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                <div>
                    <h1 className="text-5xl font-black text-dark tracking-tighter uppercase mb-2">
                        Dashboard
                    </h1>
                    <p className="text-dark font-bold text-lg bg-secondary inline-block px-2 border-2 border-dark">
                        Smart Warranty. Zero Hassle.
                    </p>
                </div>
                <div>
                    <Link to="/warranties/new">
                        <GlowingButton variant="primary">
                            <Plus className="w-5 h-5" strokeWidth={3} />
                            <span>ADD NEW</span>
                        </GlowingButton>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Total Value Card */}
                <div className="md:col-span-2">
                    <div className="neu-card bg-accent p-8 h-full flex flex-col justify-center">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-dark font-black text-xl uppercase mb-2 border-b-4 border-dark inline-block pr-6">
                                    Total Protection Value
                                </h2>
                                <div className="text-6xl font-black text-dark my-4 tracking-tighter">
                                    {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue)}
                                </div>
                                <p className="text-dark font-bold bg-white inline-block px-2 border-2 border-dark">
                                    ESTIMATED REPLACEMENT COST
                                </p>
                            </div>
                            <div className="relative w-32 h-32 hidden sm:flex items-center justify-center bg-white border-4 border-dark rounded-full shadow-neu">
                                <div className="text-center">
                                    <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-1" strokeWidth={2.5} />
                                    <div className="text-[10px] text-dark font-black uppercase tracking-widest mt-1">Status</div>
                                    <div className="font-black text-dark text-sm">{protectionStatus}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Insights */}
                <div className="space-y-6 flex flex-col">
                    <div className="neu-card p-6 bg-primary flex-1 flex flex-col justify-center">
                        <h3 className="font-black text-2xl text-dark uppercase mb-4 tracking-tight">Quick Add</h3>
                        <div className="flex gap-4">
                            <Link to="/warranties/new?mode=scan" className="neu-button-secondary flex-1 text-center py-2 text-sm">
                                SCAN RECEIPT
                            </Link>
                            <Link to="/warranties/new?mode=manual" className="neu-button-secondary flex-1 text-center py-2 text-sm">
                                ENTER MANUALLY
                            </Link>
                        </div>
                    </div>

                    <div className="neu-card p-6 bg-white flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 border-4 border-dark bg-secondary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <TrendingUp className="w-6 h-6 text-dark" strokeWidth={3} />
                            </div>
                            <h3 className="font-black text-xl text-dark uppercase tracking-tight">AI Insights</h3>
                        </div>
                        <p className="text-dark font-medium text-lg border-l-4 border-primary pl-4">
                            You saved <span className="bg-accent px-1 font-black border-2 border-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block mx-1">{Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalSavings)}</span> this year by tracking warranties.
                        </p>
                    </div>
                </div>
            </div>

            {/* Alerts Section */}
            {expiringSoonCount > 0 && (
                <Link to="/notifications" className="block mb-10 group">
                    <div className="neu-card p-6 bg-red-400 group-hover:-translate-y-1 group-hover:bg-red-500 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="p-3 bg-white border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
                                    <AlertTriangle className="w-8 h-8 text-dark" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-black text-2xl text-dark uppercase tracking-tight mb-1">Attention Required</h3>
                                    <p className="text-dark font-bold text-lg bg-white inline-block px-2 border-2 border-dark">
                                        You have {expiringSoonCount} warrant{expiringSoonCount === 1 ? 'y' : 'ies'} expiring in the next 30 days.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-dark font-black text-sm uppercase tracking-wider bg-white px-4 py-2 border-4 border-dark hover:bg-secondary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                VIEW ALERTS
                                <Plus className="w-5 h-5 rotate-45" strokeWidth={3} />
                            </div>
                        </div>
                    </div>
                </Link>
            )}

            {/* Filter & Grid */}
            <div className="mb-8">
                <CategoryFilter
                    categories={categories}
                    selected={selectedCategory}
                    onSelect={setSelectedCategory}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredWarranties.map(warranty => (
                    <WarrantyCard key={warranty._id || warranty.id} warranty={warranty} />
                ))}
            </div>
        </div>
    );
};
