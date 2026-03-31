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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="pb-32 pt-8 px-4 max-w-7xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                        Dashboard
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">
                        Smart Warranty. Zero Hassle.
                    </p>
                </div>
                <div>
                    <Link to="/warranties/new">
                        <GlowingButton variant="primary">
                            <Plus className="w-5 h-5" strokeWidth={2.5} />
                            <span>Add Item</span>
                        </GlowingButton>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Total Value Card */}
                <div className="md:col-span-2">
                    <div className="neu-card bg-gradient-to-br from-indigo-50 to-blue-50 p-8 h-full flex flex-col justify-center border-none shadow-md">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-indigo-900 font-semibold text-sm uppercase tracking-wider mb-2">
                                    Total Protection Value
                                </h2>
                                <div className="text-5xl font-extrabold text-indigo-950 my-2 tracking-tight">
                                    {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(totalValue)}
                                </div>
                                <p className="text-indigo-600 font-medium text-sm mt-2 flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4" /> Estimated replacement cost
                                </p>
                            </div>
                            <div className="relative w-28 h-28 hidden sm:flex items-center justify-center bg-white rounded-full shadow-sm border border-indigo-100">
                                <div className="text-center">
                                    <ShieldCheck className="w-8 h-8 text-primary mx-auto mb-1" strokeWidth={2} />
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Status</div>
                                    <div className="font-bold text-slate-800 text-sm whitespace-nowrap">{protectionStatus}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Insights */}
                <div className="space-y-6 flex flex-col">
                    <div className="neu-card p-6 bg-white flex-1 flex flex-col justify-center">
                        <h3 className="font-semibold text-slate-800 mb-4">Quick Add</h3>
                        <div className="flex gap-3">
                            <Link to="/warranties/new?mode=scan" className="neu-button-secondary flex-1 text-center py-2 text-sm bg-slate-50 border-slate-200 hover:bg-slate-100 shadow-sm">
                                Scan Receipt
                            </Link>
                            <Link to="/warranties/new?mode=manual" className="neu-button-secondary flex-1 text-center py-2 text-sm bg-slate-50 border-slate-200 hover:bg-slate-100 shadow-sm">
                                Enter Manual
                            </Link>
                        </div>
                    </div>

                    <div className="neu-card p-6 bg-gradient-to-br from-emerald-50 to-teal-50 flex-1 flex flex-col justify-center border-emerald-100/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                                <TrendingUp className="w-5 h-5" strokeWidth={2.5} />
                            </div>
                            <h3 className="font-bold text-emerald-900">AI Insights</h3>
                        </div>
                        <p className="text-emerald-800 font-medium text-sm leading-relaxed">
                            You saved <span className="font-bold text-emerald-900">{Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(totalSavings)}</span> this year by tracking warranties efficiently.
                        </p>
                    </div>
                </div>
            </div>

            {/* Alerts Section */}
            {expiringSoonCount > 0 && (
                <Link to="/notifications" className="block mb-10 group">
                    <div className="neu-card p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-xl group-hover:scale-105 transition-transform">
                                    <AlertTriangle className="w-6 h-6" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-amber-900 tracking-tight mb-0.5">Attention Required</h3>
                                    <p className="text-amber-700 text-sm font-medium">
                                        You have {expiringSoonCount} warrant{expiringSoonCount === 1 ? 'y' : 'ies'} expiring in the next 30 days.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm group-hover:text-amber-900 transition-colors">
                                View Alerts
                                <Plus className="w-4 h-4 rotate-45" strokeWidth={2.5} />
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
