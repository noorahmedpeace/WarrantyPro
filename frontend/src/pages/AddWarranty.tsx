import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, Camera, CheckCircle2, ChevronRight, ClipboardCheck, Loader2, Package2, Save, ScanLine, ShieldCheck, Sparkles } from 'lucide-react';
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
    const [showSuccessState, setShowSuccessState] = useState(false);
    const redirectTimerRef = useRef<number | null>(null);
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

    useEffect(() => () => {
        if (redirectTimerRef.current) {
            window.clearTimeout(redirectTimerRef.current);
        }
    }, []);

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
            setNotice({ tone: 'success', text: 'Warranty saved successfully. Your reminders and claim workspace are now ready.' });
            setShowSuccessState(true);
            redirectTimerRef.current = window.setTimeout(() => {
                navigate('/coverage');
            }, 1400);
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
        ? 'border-covered bg-covered-wash text-covered'
        : notice?.tone === 'warning'
            ? 'border-expiring bg-expiring-wash text-expiring'
            : 'border-expired bg-expired-wash text-expired';

    return (
        <div className="page-shell relative max-w-5xl overflow-hidden">
            <button onClick={() => navigate('/coverage')} className="page-back"><ArrowLeft className="w-5 h-5" />Back to Dashboard</button>

            <AnimatePresence mode="wait">
                {mode === 'scan' ? (
                    <motion.div key="scan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="glass-card glow-accent overflow-hidden px-6 py-10 sm:px-8 sm:py-12">
                            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-center">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-accent bg-accent-wash px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-accent"><Sparkles className="h-3.5 w-3.5" strokeWidth={2} />AI Intake</div>
                                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Scan a receipt and let WarrantyPro build the first draft.</h2>
                                    <p className="mt-4 max-w-xl text-base leading-8 text-ink-muted">Capture the proof once. Our intake flow extracts the product, pricing, and coverage signals so you can review instead of typing from scratch.</p>
                                    <div className="mt-8 flex max-w-sm flex-col gap-4">
                                        <label className="relative">
                                            <input type="file" accept="image/*" onChange={handleScan} className="hidden" disabled={scanning} />
                                            <div className="row-interactive flex w-full cursor-pointer items-center justify-center gap-3 rounded-control border border-accent bg-accent px-8 py-3.5 text-base font-semibold text-on-accent transition-all">
                                                {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                                                {scanning ? 'Analyzing receipt...' : 'Open Camera'}
                                            </div>
                                        </label>
                                        <button type="button" onClick={() => openManualMode('identity')} className="row-interactive rounded-control border border-rule bg-surface px-5 py-3 text-sm font-semibold text-ink-muted transition-colors hover:text-ink">Enter details manually instead</button>
                                    </div>
                                </div>
                                {/* The scanner, idling until a photo arrives. While the OCR
                                    call is in flight the beam sweeps this receipt: the
                                    animation IS the progress indicator. */}
                                <div className="flex flex-col items-center gap-5">
                                    <div className={`relative w-[220px] rotate-[-3deg] bg-[#FCFBF7] px-4 pb-4 pt-3.5 font-mono text-[10.5px] leading-[1.8] text-[#33322D] shadow-overlay ${scanning ? 'scan-running' : ''}`}>
                                        <p className="font-semibold tracking-wide">YOUR RECEIPT</p>
                                        <p className="text-[#8A877D]">waiting for its photo</p>
                                        <p className="my-1.5 border-t border-dashed border-[#D9D6CB]" />
                                        <p>PRODUCT ..............</p>
                                        <p>DATE .................</p>
                                        <p>PRICE ................</p>
                                        <p>WARRANTY .............</p>
                                        <div
                                            className="mt-2.5 h-6"
                                            style={{
                                                background:
                                                    'repeating-linear-gradient(90deg, #33322D 0 2px, transparent 2px 5px, #33322D 5px 6px, transparent 6px 10px)',
                                            }}
                                        />
                                        <div className="scan-beam" />
                                    </div>
                                    <p aria-live="polite" className="text-center text-label text-ink-muted">
                                        {scanning
                                            ? 'Reading the paper. A few seconds.'
                                            : 'Hand it a photo and the beam does the typing.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="manual" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="page-section">
                            <div className="mb-8 flex flex-col gap-5 border-b border-rule pb-6 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight text-ink">Add Warranty</h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-muted">Move through the product, coverage, and review steps so the record is clean before it enters reminders and claim workflows.</p>
                                </div>
                                <button type="button" onClick={() => setMode('scan')} className="row-interactive inline-flex items-center gap-2 rounded-control border border-rule bg-surface-raised px-4 py-3 text-sm font-semibold text-ink-muted transition-all hover:text-ink"><ScanLine className="w-4 h-4" />Switch to AI Scan</button>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-3 md:grid-cols-3">
                                        {manualSteps.map((step, index) => {
                                            const Icon = step.icon;
                                            const active = manualStep === step.key;
                                            const complete = currentStepIndex > index;
                                            return (
                                                <button key={step.key} type="button" onClick={() => setManualStep(step.key)} className={`rounded-surface border px-4 py-4 text-left transition-[transform,border-color,background-color] duration-enter ease-enter hover:-translate-y-0.5 ${active ? 'border-accent bg-accent-wash' : 'border-rule bg-surface hover:border-white/[0.16]'}`}>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className={`rounded-control p-2.5 ${active ? 'bg-surface text-accent' : 'bg-surface-raised text-ink-muted'}`}><Icon className="h-4.5 w-4.5" strokeWidth={2} /></div>
                                                        {complete && <CheckCircle2 className="h-4 w-4 text-covered" aria-hidden="true" />}
                                                    </div>
                                                    <div className="mt-4 text-sm font-semibold text-ink">{step.label}</div>
                                                    <p className="mt-1 text-sm leading-6 text-ink-muted">{step.description}</p>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <motion.div key={manualStep} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-surface border border-rule bg-surface-raised p-5 sm:p-6">
                                        {manualStep === 'identity' && (
                                            <div className="space-y-5">
                                                <div><p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-neutral">Product Identity</p><h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink">Start with the product basics.</h3></div>
                                                <div className="space-y-2"><label className="page-label">Product Name</label><input type="text" required value={formData.product_name} onChange={(e) => setFormData({ ...formData, product_name: e.target.value })} className="field-input w-full" placeholder="e.g. MacBook Pro M3" /></div>
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    <div className="space-y-2"><label className="page-label">Brand</label><input type="text" required value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="field-input w-full" placeholder="e.g. Apple" /></div>
                                                    <div className="space-y-2"><label className="page-label">Price ({currencySymbol})</label><input type="number" required min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="field-input w-full" placeholder="0.00" /></div>
                                                </div>
                                            </div>
                                        )}
                                        {manualStep === 'coverage' && (
                                            <div className="space-y-5">
                                                <div><p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-neutral">Coverage Window</p><h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink">Set the dates your reminders will rely on.</h3></div>
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    <div className="space-y-2"><label className="page-label">Purchase Date</label><input type="date" required value={formData.purchase_date} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} className="field-input w-full" /></div>
                                                    <div className="space-y-2"><label className="page-label">Duration (Months)</label><input type="number" required min="1" value={formData.warranty_duration_months} onChange={(e) => setFormData({ ...formData, warranty_duration_months: parseInt(e.target.value, 10) || 1 })} className="field-input w-full" /></div>
                                                </div>
                                                <div className="rounded-surface border border-rule bg-surface px-4 py-4"><div className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-neutral">Estimated Expiry</div><div className="mt-2 text-xl font-semibold tracking-[-0.04em] text-ink">{expiryPreview}</div><p className="mt-2 text-sm leading-6 text-ink-muted">This is the date WarrantyPro will use for reminders and urgency signals.</p></div>
                                            </div>
                                        )}
                                        {manualStep === 'review' && (
                                            <div className="space-y-5">
                                                <div><p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-neutral">Review and Save</p><h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink">Final check before the record goes live.</h3></div>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <ReviewCard label="Product" value={formData.product_name || 'Product name pending'} helper={formData.brand || 'Brand pending'} />
                                                    <ReviewCard label="Value" value={Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(formData.price || 0)} helper="Captured purchase value" />
                                                    <ReviewCard label="Purchased" value={formData.purchase_date || 'Date pending'} helper="Original purchase date" />
                                                    <ReviewCard label="Coverage" value={`${formData.warranty_duration_months || 0} months`} helper={`Estimated expiry ${expiryPreview}`} />
                                                </div>
                                                <div className="rounded-surface border border-rule bg-surface px-4 py-4"><div className="flex items-start gap-3 text-ink-muted"><div className="rounded-full bg-accent-wash p-2.5 text-accent"><ShieldCheck className="h-4.5 w-4.5" strokeWidth={2} /></div><p className="text-sm leading-7">This record will feed reminders, dashboard summaries, and claim workflows. If anything looks off, jump back to the earlier steps before saving.</p></div></div>
                                            </div>
                                        )}
                                    </motion.div>

                                    <div className="flex flex-col gap-3 rounded-surface border border-rule bg-surface px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="text-sm text-ink-muted">{manualStep === 'review' ? 'Everything looks ready. Save it when it reads right.' : 'Move step by step, then do a final draft review before saving.'}</div>
                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            {currentStepIndex > 0 && <button type="button" onClick={() => setManualStep(manualSteps[Math.max(currentStepIndex - 1, 0)].key)} className="rounded-full border border-rule bg-surface px-5 py-3 text-sm font-semibold text-ink-muted transition-colors hover:border-rule hover:text-ink">Back</button>}
                                            {manualStep !== 'review' ? (
                                                <button type="button" onClick={() => setManualStep(manualSteps[Math.min(currentStepIndex + 1, manualSteps.length - 1)].key)} disabled={(manualStep === 'identity' && !identityReady) || (manualStep === 'coverage' && !coverageReady)} className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-pressed disabled:cursor-not-allowed disabled:opacity-50">Continue<ChevronRight className="h-4 w-4" strokeWidth={2} /></button>
                                            ) : (
                                                <GlowingButton type="submit" className="px-5 py-3 text-sm" isLoading={loading}><Save className="w-4 h-4 mr-2" />Save warranty</GlowingButton>
                                            )}
                                        </div>
                                    </div>
                                </form>

                                <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
                                    {notice && <div className={`rounded-surface border px-4 py-4 text-sm font-medium leading-6 ${noticeStyle}`}>{notice.text}</div>}
                                    <div className="glass-card p-5">
                                        <p className="text-caption font-semibold uppercase text-neutral">Current draft</p>
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

            <AnimatePresence>
                {showSuccessState && (
                    <motion.div
                        className="fixed inset-0 z-[65] flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="glass-card glow-accent relative z-10 w-full max-w-md bg-surface px-6 py-7 text-center sm:px-8"
                            initial={{ opacity: 0, y: 18, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 14, scale: 0.985 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
                            <motion.div
                                className="empty-icon mb-5"
                            >
                                <CheckCircle2 className="h-7 w-7 text-covered" />
                            </motion.div>
                            <p className="text-caption font-semibold uppercase text-neutral">Saved</p>
                            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-ink">
                                Warranty record is live.
                            </h3>
                            <p className="mt-4 text-sm leading-7 text-ink-muted">
                                Returning to your dashboard so the new record can appear inside reminders, portfolio views, and claims preparation.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


const DraftLine = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-surface border border-rule bg-surface-raised px-4 py-3"><div className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-neutral">{label}</div><div className="mt-2 text-sm font-semibold text-ink">{value}</div></div>
);

const ReviewCard = ({ label, value, helper }: { label: string; value: string; helper: string }) => (
    <div className="rounded-surface border border-rule bg-surface px-4 py-4"><div className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-neutral">{label}</div><div className="mt-2 text-base font-semibold text-ink">{value}</div><div className="mt-1 text-sm text-ink-muted">{helper}</div></div>
);
