import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Plus, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { warrantiesApi } from '../lib/api';
import { BentoGrid, BentoItem } from '../components/ui/BentoGrid';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowingButton } from '../components/ui/GlowingButton';
import { formatDate, getDaysRemaining } from '../lib/utils';

export const Dashboard = () => {
    const [warranties, setWarranties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    const expiringSoon = warranties.filter(w => {
        if (!w.purchase_date) return false;
        const expiryDate = new Date(w.purchase_date);
        expiryDate.setMonth(expiryDate.getMonth() + (w.warranty_duration_months || 0));
        const days = getDaysRemaining(expiryDate.toISOString());
        return days > 0 && days <= 30;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="pb-24 pt-8">
            <header className="mb-8 px-4 max-w-7xl mx-auto flex justify-between items-end">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-2">
                        WarrantyPro
                    </h1>
                    <p className="text-slate-400">Protect your investments.</p>
                </div>
                <Link to="/warranties/new">
                    <GlowingButton>
                        <Plus className="w-5 h-5" />
                        <span className="hidden md:inline">Add New</span>
                    </GlowingButton>
                </Link>
            </header>

            <BentoGrid>
                {/* Welcome / Stats */}
                <BentoItem span={2} className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/20">
                    <div className="p-6 h-full flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Overview</h2>
                                <p className="text-blue-200">Your protection status is good.</p>
                            </div>
                            <ShieldCheck className="w-12 h-12 text-blue-400 opacity-50" />
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-8">
                            <div>
                                <div className="text-3xl font-bold text-white">{warranties.length}</div>
                                <div className="text-xs text-blue-200 uppercase tracking-wider">Total</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-emerald-400">
                                    {warranties.filter(w => !expiringSoon.includes(w)).length}
                                </div>
                                <div className="text-xs text-emerald-200/70 uppercase tracking-wider">Active</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-amber-400">{expiringSoon.length}</div>
                                <div className="text-xs text-amber-200/70 uppercase tracking-wider">Expiring</div>
                            </div>
                        </div>
                    </div>
                </BentoItem>

                {/* Action Card */}
                <BentoItem className="bg-gradient-to-br from-emerald-500/10 to-emerald-900/10 border-emerald-500/20 group relative overflow-hidden">
                    <Link to="/warranties/new" className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Plus className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">Quick Add</h3>
                            <p className="text-sm text-emerald-200/60">Scan receipt or enter details</p>
                        </div>
                    </Link>
                </BentoItem>

                {/* Expiring Soon List */}
                {expiringSoon.length > 0 && (
                    <BentoItem span={3} className="bg-red-500/5 border-red-500/10">
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                <h3 className="font-bold text-red-200">Expiring Soon</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {expiringSoon.map(w => (
                                    <GlassCard key={w.id} className="p-4 bg-red-500/5 hover:bg-red-500/10 border-red-500/10">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{w.product_name}</h4>
                                                <p className="text-xs text-red-300 mt-1">Expires in {getDaysRemaining(new Date(new Date(w.purchase_date).setMonth(new Date(w.purchase_date).getMonth() + w.warranty_duration_months)).toISOString())} days</p>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        </div>
                    </BentoItem>
                )}

                {/* Recent Items */}
                <BentoItem span={3}>
                    <div className="p-6">
                        <h3 className="font-bold text-slate-300 mb-4">Recent Items</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {warranties.map(w => (
                                <Link key={w.id} to={`/warranties/${w.id}`}>
                                    <GlassCard className="cursor-pointer group">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                                <Package className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white group-hover:text-blue-300 transition-colors">{w.product_name}</h4>
                                                <p className="text-xs text-slate-400">{w.brand} • Purchased {formatDate(w.purchase_date)}</p>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </Link>
                            ))}
                            {warranties.length === 0 && (
                                <div className="col-span-full py-8 text-center text-slate-500">
                                    No warranties added yet.
                                </div>
                            )}
                        </div>
                    </div>
                </BentoItem>
            </BentoGrid>
        </div>
    );
};
