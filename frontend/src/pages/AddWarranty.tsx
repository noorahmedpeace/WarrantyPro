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
        <div className="page-shell max-w-3xl">
            <button
                onClick={() => navigate('/')}
                className="page-back"
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
                        <div className="page-section px-6 py-16 text-center">
                            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-sky-200 bg-sky-50">
                                <ScanLine className="w-10 h-10 text-sky-600" />
                            </div>
                            <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-950">Scan Receipt</h2>
                            <p className="mx-auto mb-8 max-w-sm text-base font-medium text-slate-600">
                                Take a photo of your receipt. Our AI extracts the details securely and instantly.
                            </p>

                            <div className="flex flex-col gap-4 max-w-xs mx-auto">
                                <label className="relative">
                                    <input type="file" accept="image/*" onChange={handleScan} className="hidden" disabled={scanning} />
                                    <div className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-slate-950 bg-slate-950 px-8 py-3.5 text-base font-semibold text-white transition-all hover:-translate-y-0.5">
                                        {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                                        {scanning ? 'Analyzing...' : 'Open Camera'}
                                    </div>
                                </label>

                                <button
                                    onClick={() => setMode('manual')}
                                    className="mt-2 py-3 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
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
                        <div className="page-section">
                            <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-6">
                                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                                    Warranty Details
                                </h2>
                                <button
                                    onClick={() => setMode('scan')}
                                    className="rounded-xl border border-slate-200 bg-[#f8fafc] p-2.5 text-slate-600 transition-all hover:text-slate-950"
                                    title="Switch to Scan"
                                >
                                    <ScanLine className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="page-label">Product Name</label>
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
                                        <label className="page-label">Brand</label>
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
                                        <label className="page-label">Price ({Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(0).charAt(0)})</label>
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
                                        <label className="page-label">Purchase Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.purchase_date}
                                            onChange={e => setFormData({ ...formData, purchase_date: e.target.value })}
                                            className="neu-input w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="page-label">Duration (Months)</label>
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
