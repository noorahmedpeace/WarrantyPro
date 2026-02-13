import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { warrantiesApi } from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowingButton } from '../components/ui/GlowingButton';

export const AddWarranty = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [formData, setFormData] = useState({
        product_name: '',
        brand: '',
        price: 0,
        purchase_date: new Date().toISOString().split('T')[0],
        warranty_duration_months: 12,
        category_id: '1' // Default to Electronics for now
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await warrantiesApi.create(formData);
            navigate('/');
        } catch (error) {
            console.error('Failed to create warranty', error);
            alert('Failed to save warranty');
        } finally {
            setLoading(false);
        }
    };

    const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setScanning(true);
        try {
            const result = await warrantiesApi.scanImage(file);
            setFormData(prev => ({
                ...prev,
                product_name: result.product_name || prev.product_name,
                brand: result.brand || prev.brand,
                purchase_date: result.purchase_date || prev.purchase_date,
            }));
        } catch (error) {
            console.error('Scan failed', error);
            alert('Failed to scan image');
        } finally {
            setScanning(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-24 pt-8 px-4">
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
            </motion.button>

            <GlassCard>
                <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Add New Warranty
                </h2>

                {/* AI Scan Section */}
                <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold text-white mb-2">Magic Scan</h3>
                        <p className="text-sm text-blue-200 mb-6">Upload a receipt to auto-fill details.</p>

                        <label className="inline-flex">
                            <input type="file" accept="image/*" onChange={handleScan} className="hidden" disabled={scanning} />
                            <div className="cursor-pointer bg-white text-blue-600 font-bold py-3 px-8 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                                {scanning ? 'Analyzing...' : 'Scan Receipt'}
                            </div>
                        </label>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Product Name</label>
                        <input
                            type="text"
                            required
                            value={formData.product_name}
                            onChange={e => setFormData({ ...formData, product_name: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="e.g. MacBook Pro M3"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Brand</label>
                            <input
                                type="text"
                                required
                                value={formData.brand}
                                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="e.g. Apple"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Price ({Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(0).charAt(0)})</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Purchase Date</label>
                            <input
                                type="date"
                                required
                                value={formData.purchase_date}
                                onChange={e => setFormData({ ...formData, purchase_date: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Warranty Duration (Months)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.warranty_duration_months}
                                onChange={e => setFormData({ ...formData, warranty_duration_months: parseInt(e.target.value) })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <GlowingButton type="submit" className="w-full py-4 text-lg" isLoading={loading}>
                            <Save className="w-5 h-5" />
                            Save Protection
                        </GlowingButton>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};
