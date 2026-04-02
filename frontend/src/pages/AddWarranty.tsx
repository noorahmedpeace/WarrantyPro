import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, BadgeDollarSign, CalendarDays, Camera, ChevronRight, ClipboardCheck, Loader2, Package2, Save, ScanLine, ShieldCheck, Sparkles } from 'lucide-react';
import { warrantiesApi } from '../lib/api';
import { GlowingButton } from '../components/ui/GlowingButton';

type IntakeMode = 'scan' | 'manual';
type ManualStepKey = 'identity' | 'coverage' | 'review';
type NoticeTone = 'success' | 'warning' | 'error';

const manualSteps = [
    { key: 'identity' as const, label: 'Product Identity', icon: Package2, description: 'Name, brand, and value' },
    { key: 'coverage' as const, label: 'Coverage Window', icon: CalendarDays, description: 'Purchase date and term' },
    { key: 'review' as const, label: 'Review and Save', icon: ClipboardCheck, description: 'Final draft check' },
];

const getExpiryPreview = (purchaseDate: string, durationMonths: number) => {
    if (!purchaseDate || !Number.isFinite(durationMonths) || durationMonths <= 0) return 'Expiry pending';
    const baseDate = new Date(purchaseDate);
    if (Number.isNaN(baseDate.getTime())) return 'Expiry pending';
    const expiryDate = new Date(baseDate);
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
    if (Number.isNaN(expiryDate.getTime())) return 'Expiry pending';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(expiryDate);
};

export const AddWarranty = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialMode: IntakeMode = searchParams.get('mode') === 'scan' ? 'scan' : 'manual';
    const [mode, setMode] = useState<IntakeMode>(initialMode);
    const [manualStep, setManualStep] = useState<ManualStepKey>('identity');
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [notice, setNotice] = useState<{ tone: NoticeTone; text: string } | null>(null);
    const [formData, setFormData] = useState({
        product_name: '',
        brand: '',
        price: 0,
        purchase_date: new Date().toISOString().split('T')[0],
        warranty_duration_months: 12,
        category_id: '1',
    });

    useEffect(() => {
        const nextMode: IntakeMode = searchParams.get('mode') === 'scan' ? 'scan' : 'manual';
        setMode(nextMode);
        if (nextMode === 'manual') setManualStep('identity');
    }, [searchParams]);

    const currentStepIndex = manualSteps.findIndex((step) => step.key === manualStep);
    const currencySymbol = useMemo(() => Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(0).charAt(0), []);
    const expiryPreview = useMemo(() => getExpiryPreview(formData.purchase_date, formData.warranty_duration_months), [formData.purchase_date, formData.warranty_duration_months]);
    const identityReady = formData.product_name.trim().length > 0 && formData.brand.trim().length > 0;
    const coverageReady = Boolean(formData.purchase_date) && formData.warranty_duration_months > 0;

    const openManualMode = (step: ManualStepKey = 'identity') => {
        setMode('manual');
        setManualStep(step);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setNotice(null);
        try {
            await warrantiesApi.create(formData);
            navigate('/');
        } catch (error) {
            console.error('Failed to create warranty', error);
            setNotice({ tone: 'error', text: 'Warranty could not be saved right now. Please review the draft and try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setScanning(true);
        setNotice(null);
        try {
            const result = await warrantiesApi.scanImage(file);
            setFormData((prev) => ({
                ...prev,
                product_name: result.productName || prev.product_name,
                brand: result.brand || prev.brand,
                price: result.price || prev.price,
                purchase_date: result.purchaseDate || prev.purchase_date,
                warranty_duration_months: result.warrantyDuration || prev.warranty_duration_months,
            }));
            setNotice({
                tone: result.confidence === 'low' ? 'warning' : 'success',
                text: result.confidence === 'low'
                    ? 'Low-confidence scan detected. Review the extracted fields carefully before saving.'
                    : 'Receipt scanned successfully. Review the extracted draft and save when it looks right.',
            });
            setMode('manual');
            setManualStep('review');
        } catch (error) {
            console.error('Scan failed', error);
            setNotice({ tone: 'error', text: 'Receipt scanning failed. You can try again or continue with manual entry.' });
            setMode('manual');
            setManualStep('identity');
        } finally {
            setScanning(false);
            e.target.value = '';
        }
    };

    const noticeStyle = notice?.tone === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : notice?.tone === 'warning'
            ? 'border-amber-200 bg-amber-50 text-amber-700'
            : 'border-red-200 bg-red-50 text-red-700';

    return (
        <div className="page-shell max-w-5xl">
            <button onClick={() => navigate('/')} className="page-back"><ArrowLeft className="w-5 h-5" />Back to Dashboard</button>

            <AnimatePresence mode="wait">
                {mode === 'scan' ? (
                    <motion.div key="scan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="page-section overflow-hidden px-6 py-10 sm:px-8 sm:py-12">
                            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-center">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-sky-700"><Sparkles className="h-3.5 w-3.5" strokeWidth={2} />AI Intake</div>
                                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Scan a receipt and let WarrantyPro build the first draft.</h2>
                                    <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">Capture the proof once. Our intake flow extracts the product, pricing, and coverage signals so you can review instead of typing from scratch.</p>
                                    <div className="mt-8 flex max-w-sm flex-col gap-4">
                                        <label className="relative">
                                            <input type="file" accept="image/*" onChange={handleScan} className="hidden" disabled={scanning} />
                                            <div className="micro-lift flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-slate-950 bg-slate-950 px-8 py-3.5 text-base font-semibold text-white transition-all">
                                                {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                                                {scanning ? 'Analyzing receipt...' : 'Open Camera'}
                                            </div>
                                        </label>
                                        <button type="button" onClick={() => openManualMode('identity')} className="micro-lift rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950">Enter details manually instead</button>
                                    </div>
                                </div>
                                <div className="rounded-[1.8rem] border border-slate-200 bg-[#fbfdff] p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-2xl bg-sky-50 p-3 text-sky-700"><ScanLine className="h-5 w-5" strokeWidth={2} /></div>
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
                    <motion.div key="manual" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="page-section">
                            <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">Add Warranty</h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">Move through the product, coverage, and review steps so the record is clean before it enters reminders and claim workflows.</p>
                                </div>
                                <button type="button" onClick={() => setMode('scan')} className="micro-lift inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:text-slate-950"><ScanLine className="w-4 h-4" />Switch to AI Scan</button>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-3 md:grid-cols-3">
                                        {manualSteps.map((step, index) => {
                                            const Icon = step.icon;
                                            const active = manualStep === step.key;
                                            const complete = currentStepIndex > index;
                                            return (
                                                <button key={step.key} type="button" onClick={() => setManualStep(step.key)} className={`rounded-[1.4rem] border px-4 py-4 text-left transition-all ${active ? 'border-sky-300 bg-sky-50 shadow-[0_12px_28px_rgba(56,189,248,0.1)]' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className={`rounded-2xl p-2.5 ${active ? 'bg-white text-sky-700' : 'bg-slate-100 text-slate-700'}`}><Icon className="h-4.5 w-4.5" strokeWidth={2} /></div>
                                                        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-400">{complete ? 'Ready' : `Step 0${index + 1}`}</span>
                                                    </div>
                                                    <div className="mt-4 text-sm font-semibold text-slate-950">{step.label}</div>
                                                    <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <motion.div key={manualStep} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.6rem] border border-slate-200 bg-[#fbfdff] p-5 sm:p-6">
                                        {manualStep === 'identity' && (
                                            <div className="space-y-5">
                                                <div><p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Product Identity</p><h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">Start with the product basics.</h3></div>
                                                <div className="space-y-2"><label className="page-label">Product Name</label><input type="text" required value={formData.product_name} onChange={(e) => setFormData({ ...formData, product_name: e.target.value })} className="neu-input w-full" placeholder="e.g. MacBook Pro M3" /></div>
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    <div className="space-y-2"><label className="page-label">Brand</label><input type="text" required value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="neu-input w-full" placeholder="e.g. Apple" /></div>
                                                    <div className="space-y-2"><label className="page-label">Price ({currencySymbol})</label><input type="number" required min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="neu-input w-full" placeholder="0.00" /></div>
                                                </div>
                                            </div>
                                        )}
                                        {manualStep === 'coverage' && (
                                            <div className="space-y-5">
                                                <div><p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Coverage Window</p><h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">Set the dates your reminders will rely on.</h3></div>
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    <div className="space-y-2"><label className="page-label">Purchase Date</label><input type="date" required value={formData.purchase_date} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} className="neu-input w-full" /></div>
                                                    <div className="space-y-2"><label className="page-label">Duration (Months)</label><input type="number" required min="1" value={formData.warranty_duration_months} onChange={(e) => setFormData({ ...formData, warranty_duration_months: parseInt(e.target.value, 10) || 1 })} className="neu-input w-full" /></div>
                                                </div>
                                                <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4"><div className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Estimated Expiry</div><div className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">{expiryPreview}</div><p className="mt-2 text-sm leading-6 text-slate-600">This is the date WarrantyPro will use for reminders and urgency signals.</p></div>
                                            </div>
                                        )}
                                        {manualStep === 'review' && (
                                            <div className="space-y-5">
                                                <div><p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Review and Save</p><h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">Final check before the record goes live.</h3></div>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <ReviewCard label="Product" value={formData.product_name || 'Product name pending'} helper={formData.brand || 'Brand pending'} />
                                                    <ReviewCard label="Value" value={Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(formData.price || 0)} helper="Captured purchase value" />
                                                    <ReviewCard label="Purchased" value={formData.purchase_date || 'Date pending'} helper="Original purchase date" />
                                                    <ReviewCard label="Coverage" value={`${formData.warranty_duration_months || 0} months`} helper={`Estimated expiry ${expiryPreview}`} />
                                                </div>
                                                <div className="rounded-[1.3rem] border border-slate-200 bg-white px-4 py-4"><div className="flex items-start gap-3 text-slate-600"><div className="rounded-full bg-sky-50 p-2.5 text-sky-700"><ShieldCheck className="h-4.5 w-4.5" strokeWidth={2} /></div><p className="text-sm leading-7">This record will feed reminders, dashboard summaries, and claim workflows. If anything looks off, jump back to the earlier steps before saving.</p></div></div>
                                            </div>
                                        )}
                                    </motion.div>

                                    <div className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="text-sm text-slate-600">{manualStep === 'review' ? 'Everything looks ready. Save the protection record when you are comfortable.' : 'Move step by step, then do a final draft review before saving.'}</div>
                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            {currentStepIndex > 0 && <button type="button" onClick={() => setManualStep(manualSteps[Math.max(currentStepIndex - 1, 0)].key)} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950">Back</button>}
                                            {manualStep !== 'review' ? (
                                                <button type="button" onClick={() => setManualStep(manualSteps[Math.min(currentStepIndex + 1, manualSteps.length - 1)].key)} disabled={(manualStep === 'identity' && !identityReady) || (manualStep === 'coverage' && !coverageReady)} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">Continue<ChevronRight className="h-4 w-4" strokeWidth={2} /></button>
                                            ) : (
                                                <GlowingButton type="submit" className="px-5 py-3 text-sm" isLoading={loading}><Save className="w-4 h-4 mr-2" />Save Protection</GlowingButton>
                                            )}
                                        </div>
                                    </div>
                                </form>

                                <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
                                    {notice && <div className={`rounded-[1.2rem] border px-4 py-4 text-sm font-medium leading-6 ${noticeStyle}`}>{notice.text}</div>}
                                    <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Current Draft</p>
                                        <div className="mt-5 space-y-4">
                                            <DraftLine label="Product" value={formData.product_name || 'Waiting for product name'} />
                                            <DraftLine label="Brand" value={formData.brand || 'Waiting for brand'} />
                                            <DraftLine label="Value" value={Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(formData.price || 0)} />
                                            <DraftLine label="Purchase Date" value={formData.purchase_date || 'Date pending'} />
                                            <DraftLine label="Estimated Expiry" value={expiryPreview} />
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const InfoLine = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
    <div className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-4"><div className="flex items-start gap-3"><div className="rounded-full bg-sky-50 p-2 text-sky-700">{icon}</div><div><div className="text-sm font-semibold text-slate-950">{title}</div><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></div></div></div>
);

const DraftLine = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-[1.15rem] border border-slate-200 bg-[#fbfdff] px-4 py-3"><div className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</div><div className="mt-2 text-sm font-semibold text-slate-950">{value}</div></div>
);

const ReviewCard = ({ label, value, helper }: { label: string; value: string; helper: string }) => (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4"><div className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</div><div className="mt-2 text-base font-semibold text-slate-950">{value}</div><div className="mt-1 text-sm text-slate-600">{helper}</div></div>
);
