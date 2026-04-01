import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Loader2, Send } from 'lucide-react';
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-white/10 border-t-[#f0ddb0] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="page-shell max-w-5xl">
            <button onClick={() => navigate(`/warranties/${warranty._id}`)} className="page-back">
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>

            <header className="page-header text-center">
                <h1 className="page-title">File Warranty Claim</h1>
                <p className="mt-3 inline-flex items-center rounded-full border border-[#dabb7c]/25 bg-[linear-gradient(180deg,rgba(245,211,119,0.12),rgba(245,211,119,0.04))] px-4 py-1.5 text-sm font-semibold text-[#f0ddb0]">
                    {warranty.product_name} <span className="mx-2 text-[#f0ddb0]/50">•</span> {warranty.brand}
                </p>
            </header>

            <div className="mb-8 rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 sm:p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex flex-1 flex-col items-center relative">
                            {index < STEPS.length - 1 && (
                                <div className="absolute left-1/2 top-6 h-px w-full bg-white/10" />
                            )}
                            <div
                                className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border transition-all ${
                                    currentStep >= step.id
                                        ? 'border-[#dabb7c]/28 bg-[linear-gradient(180deg,rgba(245,211,119,0.18),rgba(245,211,119,0.05))] text-[#f0ddb0]'
                                        : 'border-white/10 bg-white/5 text-slate-400'
                                }`}
                            >
                                {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                            </div>
                            <span className={`mt-3 text-xs font-semibold uppercase tracking-[0.22em] ${currentStep >= step.id ? 'text-white' : 'text-slate-400'}`}>
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
                            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Describe the Issue</h2>
                            <p className="text-slate-300 font-medium mb-8 text-base">
                                Tell us what&apos;s wrong with your {warranty.product_name}. Be as specific as possible.
                            </p>
                            <textarea
                                value={issueDescription}
                                onChange={(e) => setIssueDescription(e.target.value)}
                                placeholder="Example: My laptop won't turn on. The power button doesn't respond, and there's no LED indicator light..."
                                rows={6}
                                className="neu-input w-full"
                            />
                            <div className="flex justify-end mt-8">
                                <GlowingButton onClick={() => setCurrentStep(2)} disabled={!issueDescription.trim()} className="py-3 px-8 text-base">
                                    Continue to AI Diagnosis
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </GlowingButton>
                            </div>
                        </div>
                    </motion.div>
                )}

                {currentStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <div className="page-section overflow-hidden p-0">
                            <h2 className="text-xl font-bold text-white p-5 pl-6 border-b border-white/10 bg-black/10">AI Diagnostic Assistant</h2>
                            <div className="h-[600px]">
                                <DiagnosticChat
                                    warranty={warranty}
                                    onConversationUpdate={handleConversationUpdate}
                                    initialMessage={issueDescription}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/[0.07] text-slate-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            <GlowingButton
                                onClick={handleGenerateEmail}
                                disabled={conversation.length < 2 || loading}
                                isLoading={loading}
                                className="py-3.5 flex-1 sm:flex-none justify-center text-base"
                            >
                                Generate Claim Email
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </GlowingButton>
                        </div>
                    </motion.div>
                )}

                {currentStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <div className="page-section overflow-hidden p-0">
                            <h2 className="text-xl font-bold text-white p-5 pl-6 border-b border-white/10 bg-black/10">Review Claim Email</h2>
                            <div className="p-4 sm:p-6 bg-black/10">
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
                        <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/[0.07] text-slate-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Chat
                            </button>
                            <GlowingButton
                                onClick={handleSubmitClaim}
                                disabled={!manufacturerEmail || submitting}
                                isLoading={submitting}
                                className="py-3.5 flex-1 sm:flex-none justify-center text-base"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Submit Claim
                            </GlowingButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
