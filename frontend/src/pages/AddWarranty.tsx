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
                className="flex items-center gap-2 text-dark font-bold hover:bg-secondary inline-flex px-4 py-2 border-2 border-transparent hover:border-dark hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-8 transition-all uppercase"
            >
                <ArrowLeft className="w-5 h-5" strokeWidth={3} />
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
                        <div className="neu-card bg-white text-center py-16 px-6">
                            <div className="w-24 h-24 bg-accent border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none flex items-center justify-center mx-auto mb-8">
                                <ScanLine className="w-12 h-12 text-dark" strokeWidth={2.5} />
                            </div>
                            <h2 className="text-4xl font-black text-dark uppercase tracking-tighter mb-4">Scan Receipt</h2>
                            <p className="text-dark font-bold mb-8 max-w-md mx-auto text-lg inline-block bg-secondary px-2 border-2 border-dark">
                                Take a photo of your receipt. Our AI extracts the details.
                            </p>

                            <div className="flex flex-col gap-4 max-w-xs mx-auto">
                                <label className="relative">
                                    <input type="file" accept="image/*" onChange={handleScan} className="hidden" disabled={scanning} />
                                    <div className="w-full cursor-pointer neu-button-primary py-4 px-8 text-lg flex items-center justify-center gap-3">
                                        {scanning ? <Loader2 className="w-6 h-6 animate-spin" strokeWidth={3} /> : <Camera className="w-6 h-6" strokeWidth={3} />}
                                        {scanning ? 'ANALYZING...' : 'OPEN CAMERA'}
                                    </div>
                                </label>

                                <button
                                    onClick={() => setMode('manual')}
                                    className="neu-button-secondary py-3 text-sm mt-4"
                                >
                                    SWITCH TO MANUAL ENTRY
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
                        <div className="neu-card bg-white p-6 md:p-8">
                            <div className="flex justify-between items-center mb-10 border-b-4 border-dark pb-6">
                                <h2 className="text-4xl font-black text-dark uppercase tracking-tighter">
                                    Warranty Details
                                </h2>
                                <button
                                    onClick={() => setMode('scan')}
                                    className="p-3 bg-secondary border-2 border-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-dark"
                                    title="Switch to Scan"
                                >
                                    <ScanLine className="w-6 h-6" strokeWidth={3} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-dark font-black uppercase tracking-wider text-sm bg-accent inline-block px-2 border-2 border-dark">Product Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.product_name}
                                        onChange={e => setFormData({ ...formData, product_name: e.target.value })}
                                        className="neu-input"
                                        placeholder="e.g. MacBook Pro M3"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-dark font-black uppercase tracking-wider text-sm bg-accent inline-block px-2 border-2 border-dark">Brand</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.brand}
                                            onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                            className="neu-input"
                                            placeholder="e.g. Apple"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-dark font-black uppercase tracking-wider text-sm bg-accent inline-block px-2 border-2 border-dark">Price ({Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(0).charAt(0)})</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                            className="neu-input"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-dark font-black uppercase tracking-wider text-sm bg-accent inline-block px-2 border-2 border-dark">Purchase Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.purchase_date}
                                            onChange={e => setFormData({ ...formData, purchase_date: e.target.value })}
                                            className="neu-input"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-dark font-black uppercase tracking-wider text-sm bg-accent inline-block px-2 border-2 border-dark">Warranty Duration (Months)</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={formData.warranty_duration_months}
                                            onChange={e => setFormData({ ...formData, warranty_duration_months: parseInt(e.target.value) })}
                                            className="neu-input"
                                        />
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <GlowingButton type="submit" className="w-full py-4 text-xl tracking-tight" isLoading={loading}>
                                        <Save className="w-6 h-6 mr-2" strokeWidth={3} />
                                        SAVE PROTECTION
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
