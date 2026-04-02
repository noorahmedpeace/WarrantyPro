import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Save, ArrowLeft, Loader2, ScanLine, ShieldCheck, Sparkles, CalendarDays, BadgeDollarSign } from 'lucide-react';
import { warrantiesApi } from '../lib/api';
import { GlowingButton } from '../components/ui/GlowingButton';

export const AddWarranty = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialMode = searchParams.get('mode') === 'scan' ? 'scan' : 'manual';

    const [mode, setMode] = useState<'scan' | 'manual'>(initialMode);
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [scanMessage, setScanMessage] = useState<string | null>(null);

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
        setScanMessage(null);
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
                setScanMessage('Low-confidence scan detected. Please review the extracted fields carefully before saving.');
            } else {
                setScanMessage('Receipt scanned successfully. Review the extracted details below before saving.');
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
        <div className="page-shell max-w-4xl">
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
                        <div className="page-section overflow-hidden px-6 py-10 sm:px-8 sm:py-12">
                            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-center">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-sky-700">
                                        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                                        AI Intake
                                    </div>
                                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Scan a receipt and let WarrantyPro draft the record.</h2>
                                    <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
                                        Capture the proof once. Our AI extracts the product, pricing, and date signals so you can review instead of typing from scratch.
                                    </p>

                                    <div className="mt-8 flex max-w-sm flex-col gap-4">
                                        <label className="relative">
                                            <input type="file" accept="image/*" onChange={handleScan} className="hidden" disabled={scanning} />
                                            <div className="micro-lift flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-slate-950 bg-slate-950 px-8 py-3.5 text-base font-semibold text-white transition-all">
                                                {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                                                {scanning ? 'Analyzing receipt...' : 'Open Camera'}
                                            </div>
                                        </label>

                                        <button
                                            onClick={() => setMode('manual')}
                                            className="micro-lift rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950"
                                        >
                                            Enter details manually instead
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-[1.8rem] border border-slate-200 bg-[#fbfdff] p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
                                            <ScanLine className="h-5 w-5" strokeWidth={2} />
                                        </div>
                                        <div>
                                            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-400">What happens next</p>
                                            <p className="mt-2 text-lg font-semibold text-slate-950">A faster draft, then a careful review.</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        <InfoLine icon={<ShieldCheck className="h-4.5 w-4.5" />} title="Secure extraction" text="The receipt image is processed to pull the main warranty fields automatically." />
                                        <InfoLine icon={<CalendarDays className="h-4.5 w-4.5" />} title="Date recognition" text="Purchase and expiry-related fields are suggested so your record starts structured." />
                                        <InfoLine icon={<BadgeDollarSign className="h-4.5 w-4.5" />} title="Manual review" text="You confirm every field before saving, so quality stays in your control." />
                                    </div>
                                </div>
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
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                                        Warranty Details
                                    </h2>
                                    <p className="mt-2 text-sm text-slate-600">
                                        Review the core fields below and save a clean, claim-ready protection record.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setMode('scan')}
                                    className="micro-lift rounded-xl border border-slate-200 bg-[#f8fafc] p-2.5 text-slate-600 transition-all hover:text-slate-950"
                                    title="Switch to Scan"
                                >
                                    <ScanLine className="w-5 h-5" />
                                </button>
                            </div>

                            {scanMessage && (
                                <div className="mb-6 rounded-[1.2rem] border border-sky-200 bg-sky-50 px-4 py-4 text-sm font-medium leading-6 text-sky-800">
                                    {scanMessage}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="rounded-[1.5rem] border border-slate-200 bg-[#fbfdff] p-5">
                                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Product Identity</p>
                                    <div className="mt-4 space-y-5">
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

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                                                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                                    className="neu-input w-full"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[1.5rem] border border-slate-200 bg-[#fbfdff] p-5">
                                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Coverage Window</p>
                                    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
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
                                                onChange={e => setFormData({ ...formData, warranty_duration_months: parseInt(e.target.value) || 1 })}
                                                className="neu-input w-full"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5">
                                    <div className="mb-5 flex items-start gap-3 text-slate-600">
                                        <div className="rounded-full bg-sky-50 p-2.5 text-sky-700">
                                            <ShieldCheck className="h-4.5 w-4.5" strokeWidth={2} />
                                        </div>
                                        <p className="text-sm leading-7">
                                            This record will be used across expiry tracking, notifications, and claim workflows, so a quick review here saves time later.
                                        </p>
                                    </div>
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

const InfoLine = ({
    icon,
    title,
    text,
}: {
    icon: React.ReactNode;
    title: string;
    text: string;
}) => (
    <div className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-4">
        <div className="flex items-start gap-3">
            <div className="rounded-full bg-sky-50 p-2 text-sky-700">
                {icon}
            </div>
            <div>
                <div className="text-sm font-semibold text-slate-950">{title}</div>
                <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
            </div>
        </div>
    </div>
);
