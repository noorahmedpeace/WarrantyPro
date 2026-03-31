import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, AlertTriangle, Send, Loader2 } from 'lucide-react';
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

    // Form state
    const [issueDescription, setIssueDescription] = useState('');
    const [conversation, setConversation] = useState<any[]>([]);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [manufacturerEmail, setManufacturerEmail] = useState('');
    const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');

    useEffect(() => {
        loadWarranty();
    }, [id]);

    const loadWarranty = async () => {
        try {
            const data = await warrantiesApi.getOne(id!);
            setWarranty(data);

            // Pre-fill manufacturer email if available
            if (data.brand) {
                setManufacturerEmail(`support@${data.brand.toLowerCase().replace(/\s+/g, '')}.com`);
            }
        } catch (error) {
            console.error('Failed to load warranty:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConversationUpdate = (messages: any[]) => {
        setConversation(messages);
    };

    const handleGenerateEmail = async () => {
        try {
            setLoading(true);

            // Generate troubleshooting steps from conversation
            const troubleshootingSteps = conversation
                .filter(m => m.role === 'assistant')
                .flatMap(m => {
                    const match = m.content.match(/try|check|verify|ensure/gi);
                    return match ? [m.content] : [];
                })
                .slice(0, 5);

            const conversationSummary = conversation
                .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
                .join('\n\n');

            const response = await fetch('/api/claims/generate-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    warrantyId: warranty._id,
                    issueDescription,
                    troubleshootingSteps,
                    conversationSummary
                })
            });

            if (!response.ok) throw new Error('Failed to generate email');

            const data = await response.json();
            setEmailSubject(data.subject);
            setEmailBody(data.body);
            setSeverity(data.severity || 'medium');
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
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    warrantyId: warranty._id,
                    issueDescription,
                    conversationHistory: conversation,
                    troubleshootingSteps: [],
                    emailSubject,
                    emailBody,
                    manufacturerEmail
                })
            });

            if (!response.ok) throw new Error('Failed to submit claim');

            const data = await response.json();

            // Success! Navigate to claim details
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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32 pt-8 px-4 max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-10 text-center relative border-b border-slate-100 pb-8">
                <button
                    onClick={() => navigate(`/warranties/${warranty._id}`)}
                    className="absolute left-0 top-0 flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-800 transition-colors text-sm py-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight mt-12 sm:mt-0">File Warranty Claim</h1>
                <p className="text-indigo-600 font-semibold text-sm inline-block bg-indigo-50 px-4 py-1.5 rounded-full">
                    {warranty.product_name} <span className="mx-2 text-indigo-300">•</span> {warranty.brand}
                </p>
            </header>

            {/* Progress Steps */}
            <div className="mb-12">
                <div className="flex items-center justify-between bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 relative">
                    {/* Background Line */}
                    <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-slate-100 z-0 md:left-24 md:right-24" />

                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center flex-1 relative z-10 sm:px-4">
                            <div
                                className={`w-12 h-12 flex items-center justify-center rounded-full transition-all border-2 ${currentStep >= step.id
                                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                    : 'bg-white text-slate-300 border-slate-200'
                                    }`}
                            >
                                {currentStep > step.id ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <step.icon className="w-5 h-5" />
                                )}
                            </div>
                            <span
                                className={`text-xs mt-3 font-semibold uppercase tracking-widest ${currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'
                                    }`}
                            >
                                {step.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                {currentStep === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="neu-card bg-white p-6 sm:p-10 shadow-sm border border-slate-200 rounded-2xl">
                            <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Describe the Issue</h2>
                            <p className="text-slate-500 font-medium mb-8 text-base">
                                Tell us what's wrong with your {warranty.product_name}. Be as specific as possible.
                            </p>
                            <textarea
                                value={issueDescription}
                                onChange={(e) => setIssueDescription(e.target.value)}
                                placeholder="Example: My laptop won't turn on. The power button doesn't respond, and there's no LED indicator light..."
                                rows={6}
                                className="neu-input w-full"
                            />
                            <div className="flex justify-end mt-8">
                                <GlowingButton
                                    onClick={() => setCurrentStep(2)}
                                    disabled={!issueDescription.trim()}
                                    className="py-3 px-8 text-base"
                                >
                                    Continue to AI Diagnosis
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </GlowingButton>
                            </div>
                        </div>
                    </motion.div>
                )}

                {currentStep === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="neu-card bg-white overflow-hidden p-0 shadow-sm border border-slate-200 rounded-2xl">
                            <h2 className="text-xl font-bold text-slate-900 p-5 pl-6 border-b border-slate-100 bg-slate-50">AI Diagnostic Assistant</h2>
                            <div className="h-[600px] bg-slate-50">
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
                                className="px-6 py-3.5 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
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
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="neu-card bg-white overflow-hidden p-0 shadow-sm border border-slate-200 rounded-2xl">
                            <h2 className="text-xl font-bold text-slate-900 p-5 pl-6 border-b border-slate-100 bg-slate-50">Review Claim Email</h2>
                            <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800">
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
                                className="px-6 py-3.5 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
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
