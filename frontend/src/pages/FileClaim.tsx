import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { warrantiesApi } from '../lib/api';
import { GlowingButton } from '../components/ui/GlowingButton';
import { DiagnosticChat } from '../components/DiagnosticChat';
import { ClaimEmailPreview } from '../components/ClaimEmailPreview';

const STEPS = [
    { id: 1, name: 'Describe', icon: AlertTriangle },
    { id: 2, name: 'AI Diagnosis', icon: Check },
    { id: 3, name: 'Review', icon: Send },
];

export const FileClaim: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [warranty, setWarranty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [issueDescription, setIssueDescription] = useState('');
    const [conversation, setConversation] = useState<any[]>([]);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [manufacturerEmail, setManufacturerEmail] = useState('');

    useEffect(() => {
        const loadWarranty = async () => {
            try {
                const data = await warrantiesApi.getOne(id!);
                setWarranty(data);
                if (data.brand) {
                    setManufacturerEmail(`support@${data.brand.toLowerCase().replace(/\s+/g, '')}.com`);
                }
            } catch (error) {
                console.error('Failed to load warranty:', error);
            } finally {
                setLoading(false);
            }
        };

        loadWarranty();
    }, [id]);

    const handleConversationUpdate = (messages: any[]) => {
        setConversation(messages);
    };

    const handleGenerateEmail = async () => {
        try {
            setLoading(true);

            const troubleshootingSteps = conversation
                .filter((message) => message.role === 'assistant')
                .flatMap((message) => (message.content.match(/try|check|verify|ensure/gi) ? [message.content] : []))
                .slice(0, 5);

            const conversationSummary = conversation
                .map((message) => `${message.role === 'user' ? 'User' : 'AI'}: ${message.content}`)
                .join('\n\n');

            const response = await fetch('/api/claims/generate-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('warranty_token')}`,
                },
                body: JSON.stringify({
                    warrantyId: warranty._id,
                    issueDescription,
                    troubleshootingSteps,
                    conversationSummary,
                }),
            });

            if (!response.ok) throw new Error('Failed to generate email');

            const data = await response.json();
            setEmailSubject(data.subject);
            setEmailBody(data.body);
            setCurrentStep(3);
        } catch (error) {
            console.error('Email generation error:', error);
            alert('Failed to generate email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitClaim = async () => {
        try {
            setSubmitting(true);

            const response = await fetch('/api/claims/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('warranty_token')}`,
                },
                body: JSON.stringify({
                    warrantyId: warranty._id,
                    issueDescription,
                    conversationHistory: conversation,
                    troubleshootingSteps: [],
                    emailSubject,
                    emailBody,
                    manufacturerEmail,
                }),
            });

            if (!response.ok) throw new Error('Failed to submit claim');

            const data = await response.json();
            alert(`Claim submitted successfully! Claim #${data.claim.claimNumber}`);
            navigate(`/warranties/${warranty._id}`);
        } catch (error) {
            console.error('Claim submission error:', error);
            alert('Failed to submit claim. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !warranty) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
            </div>
        );
    }

    return (
        <div className="page-shell max-w-5xl">
            <button onClick={() => navigate(`/warranties/${warranty._id}`)} className="page-back">
                <ArrowLeft className="h-4 w-4" />
                Back
            </button>

            <header className="page-header text-center">
                <h1 className="page-title">File Warranty Claim</h1>
                <p className="mt-3 inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-semibold text-sky-700">
                    {warranty.product_name} <span className="mx-2 text-sky-300">•</span> {warranty.brand}
                </p>
            </header>

            <div className="mb-8 rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="relative flex flex-1 flex-col items-center">
                            {index < STEPS.length - 1 && <div className="absolute left-1/2 top-6 h-px w-full bg-slate-200" />}
                            <div
                                className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border transition-all ${
                                    currentStep >= step.id
                                        ? 'border-sky-200 bg-sky-50 text-sky-600'
                                        : 'border-slate-200 bg-white text-slate-400'
                                }`}
                            >
                                {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                            </div>
                            <span className={`mt-3 text-xs font-semibold uppercase tracking-[0.22em] ${currentStep >= step.id ? 'text-slate-950' : 'text-slate-400'}`}>
                                {step.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {currentStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <div className="page-section">
                            <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-950">Describe the Issue</h2>
                            <p className="mb-8 text-base font-medium text-slate-600">
                                Tell us what&apos;s wrong with your {warranty.product_name}. Be as specific as possible.
                            </p>
                            <textarea
                                value={issueDescription}
                                onChange={(e) => setIssueDescription(e.target.value)}
                                placeholder="Example: My laptop won't turn on. The power button doesn't respond, and there's no LED indicator light..."
                                rows={6}
                                className="neu-input w-full"
                            />
                            <div className="mt-8 flex justify-end">
                                <GlowingButton onClick={() => setCurrentStep(2)} disabled={!issueDescription.trim()} className="px-8 py-3 text-base">
                                    Continue to AI Diagnosis
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </GlowingButton>
                            </div>
                        </div>
                    </motion.div>
                )}

                {currentStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <div className="page-section overflow-hidden p-0">
                            <h2 className="border-b border-slate-200 bg-[#f8fafc] p-5 pl-6 text-xl font-bold text-slate-950">AI Diagnostic Assistant</h2>
                            <div className="h-[600px]">
                                <DiagnosticChat
                                    warranty={warranty}
                                    onConversationUpdate={handleConversationUpdate}
                                    initialMessage={issueDescription}
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition-all hover:bg-slate-50"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </button>
                            <GlowingButton
                                onClick={handleGenerateEmail}
                                disabled={conversation.length < 2 || loading}
                                isLoading={loading}
                                className="justify-center py-3.5 text-base sm:flex-none"
                            >
                                Generate Claim Email
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </GlowingButton>
                        </div>
                    </motion.div>
                )}

                {currentStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <div className="page-section overflow-hidden p-0">
                            <h2 className="border-b border-slate-200 bg-[#f8fafc] p-5 pl-6 text-xl font-bold text-slate-950">Review Claim Email</h2>
                            <div className="bg-[#fbfdff] p-4 sm:p-6">
                                <ClaimEmailPreview
                                    subject={emailSubject}
                                    body={emailBody}
                                    warranty={warranty}
                                    onEdit={(field, value) => {
                                        if (field === 'subject') setEmailSubject(value);
                                        else setEmailBody(value);
                                    }}
                                    manufacturerEmail={manufacturerEmail}
                                    onManufacturerEmailChange={setManufacturerEmail}
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row">
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition-all hover:bg-slate-50"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Chat
                            </button>
                            <GlowingButton
                                onClick={handleSubmitClaim}
                                disabled={!manufacturerEmail || submitting}
                                isLoading={submitting}
                                className="justify-center py-3.5 text-base sm:flex-none"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Submit Claim
                            </GlowingButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
