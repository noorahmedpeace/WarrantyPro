import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Save, ArrowLeft, Loader2, ScanLine } from 'lucide-react';
import { warrantiesApi } from '../lib/api';
import { GlowingButton } from '../components/ui/GlowingButton';

export const AddWarranty = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialMode = searchParams.get('mode') === 'scan' ? 'scan' : 'manual';

    const [mode, setMode] = useState<'scan' | 'manual'>(initialMode);
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);

    const [formData, setFormData] = useState({
        product_name: '',
        brand: '',
        price: 0,
        purchase_date: new Date().toISOString().split('T')[0],
        warranty_duration_months: 12,
        category_id: '1'
    });

    // Reset mode if URL changes
    useEffect(() => {
        setMode(searchParams.get('mode') === 'scan' ? 'scan' : 'manual');
    }, [searchParams]);

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

            // Map OCR result to form data
            setFormData(prev => ({
                ...prev,
                product_name: result.productName || prev.product_name,
                brand: result.brand || prev.brand,
                price: result.price || prev.price,
                purchase_date: result.purchaseDate || prev.purchase_date,
                warranty_duration_months: result.warrantyDuration || prev.warranty_duration_months,
            }));

            // Show confidence message
            if (result.confidence === 'low') {
                alert('⚠️ Low confidence scan. Please review and correct the details below.');
            }

            // Switch to manual mode for review after successful scan
            setMode('manual');
        } catch (error) {
            console.error('Scan failed', error);
            alert('Failed to scan image. Please try entering details manually.');
        } finally {
            setScanning(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-24 pt-8 px-4">
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-800 mb-8 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
            </button>

            <AnimatePresence mode="wait">
                {mode === 'scan' ? (
                    <motion.div
                        key="scan-mode"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="neu-card bg-white text-center py-16 px-6 shadow-sm border border-slate-200">
                            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <ScanLine className="w-10 h-10 text-indigo-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Scan Receipt</h2>
                            <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto text-base">
                                Take a photo of your receipt. Our AI extracts the details securely and instantly.
                            </p>

                            <div className="flex flex-col gap-4 max-w-xs mx-auto">
                                <label className="relative">
                                    <input type="file" accept="image/*" onChange={handleScan} className="hidden" disabled={scanning} />
                                    <div className="w-full cursor-pointer bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/30 rounded-xl py-3.5 px-8 font-semibold text-base flex items-center justify-center gap-3 transition-all">
                                        {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                                        {scanning ? 'Analyzing...' : 'Open Camera'}
                                    </div>
                                </label>

                                <button
                                    onClick={() => setMode('manual')}
                                    className="text-slate-500 hover:text-slate-800 font-medium py-3 text-sm mt-2 transition-colors"
                                >
                                    Enter details manually
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="manual-mode"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="neu-card bg-white p-6 md:p-8 shadow-sm border border-slate-200">
                            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                    Warranty Details
                                </h2>
                                <button
                                    onClick={() => setMode('scan')}
                                    className="p-2.5 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                    title="Switch to Scan"
                                >
                                    <ScanLine className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Product Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.product_name}
                                        onChange={e => setFormData({ ...formData, product_name: e.target.value })}
                                        className="neu-input w-full"
                                        placeholder="e.g. MacBook Pro M3"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 ml-1">Brand</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.brand}
                                            onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                            className="neu-input w-full"
                                            placeholder="e.g. Apple"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 ml-1">Price ({Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(0).charAt(0)})</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                            className="neu-input w-full"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 ml-1">Purchase Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.purchase_date}
                                            onChange={e => setFormData({ ...formData, purchase_date: e.target.value })}
                                            className="neu-input w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 ml-1">Duration (Months)</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={formData.warranty_duration_months}
                                            onChange={e => setFormData({ ...formData, warranty_duration_months: parseInt(e.target.value) })}
                                            className="neu-input w-full"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <GlowingButton type="submit" className="w-full py-3.5 text-base" isLoading={loading}>
                                        <Save className="w-5 h-5 mr-2" />
                                        Save Protection
                                    </GlowingButton>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
