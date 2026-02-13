import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Plus, AlertTriangle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { warrantiesApi } from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowingButton } from '../components/ui/GlowingButton';
import { CategoryFilter } from '../components/CategoryFilter';
import { WarrantyCard } from '../components/WarrantyCard';
import { BottomNav } from '../components/BottomNav';
import { getDaysRemaining, formatDate } from '../lib/utils';
import { BentoGrid, BentoItem } from '../components/ui/BentoGrid'; // Keep for structure if needed, or remove if fully replaced. Based on new design, we are using grid directly but logic re-uses some parts. Actually, the new design replaced BentoGrid with standard grid.

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

    const protectionStatus = expiringSoonCount > 2 ? 'At Risk' : expiringSoonCount > 0 ? 'Needs Attention' : 'Excellent';

    // Categories
    const categories = ['All Items', ...Array.from(new Set(warranties.map(w => w.categoryId || 'Other'))).filter(c => c)];

    // Filter
    const filteredWarranties = selectedCategory === 'All Items'
        ? warranties
        : warranties.filter(w => w.categoryId === selectedCategory);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="pb-32 pt-8 px-4 max-w-7xl mx-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-1">
                        WarrantyPro
                    </h1>
                    <p className="text-slate-400 text-sm">Smart Warranty. Zero Hassle.</p>
                </div>
                <div className="hidden md:block">
                    <Link to="/warranties/new">
                        <GlowingButton>
                            <Plus className="w-4 h-4" />
                            <span>Add New</span>
                        </GlowingButton>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Total Value Card */}
                <div className="md:col-span-2 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                    <GlassCard className="relative h-full p-8 flex flex-col justify-center border-blue-500/20">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-slate-400 font-medium mb-2">Total Protection Value</h2>
                                <div className="text-5xl font-bold text-white mb-2">
                                    {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue)}
                                </div>
                                <p className="text-blue-200/60 text-sm">Estimated replacement cost covered</p>
                            </div>
                            <div className="relative w-32 h-32 hidden sm:flex items-center justify-center">
                                {/* Visual Status Indicator */}
                                <div className={`absolute inset-0 rounded-full border-8 border-white/5`} />
                                <div className={`absolute inset-0 rounded-full border-8 border-t-emerald-500 border-r-emerald-500 border-b-transparent border-l-transparent rotate-45`} />
                                <div className="text-center">
                                    <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                                    <div className="text-[10px] text-slate-400 uppercase tracking-widest">Status</div>
                                    <div className="font-bold text-emerald-400 text-sm">{protectionStatus}</div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Quick Actions & Insights */}
                <div className="space-y-6">
                    <GlassCard className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                        <h3 className="font-bold text-white mb-4">Quick Add</h3>
                        <div className="flex gap-3">
                            <Link to="/warranties/new" className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-center text-sm font-medium text-blue-200 transition-colors">
                                Scan Receipt
                            </Link>
                            <Link to="/warranties/new" className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-center text-sm font-medium text-blue-200 transition-colors">
                                Enter Manually
                            </Link>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-white">AI Insights</h3>
                        </div>
                        <p className="text-slate-400 text-sm">
                            You saved <span className="text-emerald-400 font-bold">{Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalSavings)}</span> this year by tracking warranties.
                        </p>
                    </GlassCard>
                </div>
            </div>

            {/* Filter & Grid */}
            <div className="mb-6">
                <CategoryFilter
                    categories={categories}
                    selected={selectedCategory}
                    onSelect={setSelectedCategory}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredWarranties.map(warranty => (
                    <WarrantyCard key={warranty._id || warranty.id} warranty={warranty} />
                ))}
            </div>

            <BottomNav />
        </div>
    );
};
