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
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin shadow-soft" />
            </div>
        );
    }

    return (
        <div className="pb-32 pt-8 px-4 max-w-7xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">
                        Dashboard
                    </h1>
                    <p className="text-slate-600 font-medium text-lg">
                        Smart Warranty. Zero Hassle.
                    </p>
                </div>
                <div>
                    <Link to="/warranties/new" className="trust-button trust-button-primary shadow-soft">
                        <Plus className="w-5 h-5" strokeWidth={2.5} />
                        <span>Add Warranty</span>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Total Value Card */}
                <div className="md:col-span-2">
                    <div className="trust-card p-8 h-full flex flex-col justify-center bg-gradient-to-br from-primary to-slate-800 text-white relative overflow-hidden">
                        {/* Decorative background circle */}
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="flex justify-between items-center relative z-10">
                            <div>
                                <h2 className="text-slate-100 font-medium text-lg mb-2">
                                    Total Protection Value
                                </h2>
                                <div className="text-5xl font-bold text-white my-4">
                                    {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue)}
                                </div>
                                <p className="text-slate-200 font-medium text-sm">
                                    Estimated Replacement Cost
                                </p>
                            </div>
                            <div className="relative w-32 h-32 hidden sm:flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-floating">
                                <div className="text-center">
                                    <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" strokeWidth={2.5} />
                                    <div className="text-xs text-slate-200 font-medium tracking-wide uppercase">Status</div>
                                    <div className="font-bold text-white text-sm mt-1">{protectionStatus}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Insights */}
                <div className="space-y-6 flex flex-col">
                    <div className="trust-card p-6 flex-1 flex flex-col justify-center">
                        <h3 className="font-bold text-lg text-slate-800 mb-4">Quick Add</h3>
                        <div className="flex gap-4">
                            <Link to="/warranties/new?mode=scan" className="trust-button trust-button-outline flex-1 text-center py-2.5 text-sm">
                                Scan Receipt
                            </Link>
                            <Link to="/warranties/new?mode=manual" className="trust-button trust-button-primary flex-1 text-center py-2.5 text-sm">
                                Enter Manually
                            </Link>
                        </div>
                    </div>

                    <div className="trust-card p-6 bg-emerald-50 border-emerald-100 flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                <TrendingUp className="w-5 h-5" strokeWidth={2.5} />
                            </div>
                            <h3 className="font-bold text-lg text-emerald-900 tracking-tight">AI Insights</h3>
                        </div>
                        <p className="text-emerald-800 font-medium text-sm leading-relaxed">
                            You saved <span className="font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-200 mx-1">{Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalSavings)}</span> this year by keeping your warranties organized.
                        </p>
                    </div>
                </div>
            </div>

            {/* Alerts Section */}
            {expiringSoonCount > 0 && (
                <Link to="/notifications" className="block mb-10 group">
                    <div className="trust-card p-6 bg-amber-50 border border-amber-200 hover:shadow-floating transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-xl group-hover:scale-105 transition-transform">
                                    <AlertTriangle className="w-6 h-6" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-amber-900 mb-0.5">Attention Required</h3>
                                    <p className="text-amber-800 font-medium text-sm">
                                        You have {expiringSoonCount} warrant{expiringSoonCount === 1 ? 'y' : 'ies'} expiring in the next 30 days.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-amber-700 font-semibold text-sm self-start sm:self-auto">
                                View Alerts
                                <span className="text-lg leading-none">&rarr;</span>
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
