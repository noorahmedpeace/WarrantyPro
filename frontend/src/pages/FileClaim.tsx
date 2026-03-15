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
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-dark border-t-primary rounded-none animate-spin shadow-neu" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32 pt-8 px-4 max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-10 text-center relative border-b-4 border-dark pb-6">
                <button
                    onClick={() => navigate(`/warranties/${warranty._id}`)}
                    className="absolute left-0 top-0 flex items-center gap-2 text-dark font-bold hover:bg-secondary inline-flex px-3 py-2 border-2 border-transparent hover:border-dark hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase text-sm"
                >
                    <ArrowLeft className="w-4 h-4" strokeWidth={3} />
                    Back
                </button>
                <h1 className="text-4xl font-black text-dark mb-4 uppercase tracking-tighter mt-12 sm:mt-0">File Warranty Claim</h1>
                <p className="text-dark font-bold text-lg inline-block bg-secondary px-3 py-1 border-2 border-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {warranty.product_name} <span className="mx-2">•</span> {warranty.brand}
                </p>
            </header>

            {/* Progress Steps */}
            <div className="mb-12">
                <div className="flex items-center justify-between border-4 border-dark bg-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
                    {/* Background Line */}
                    <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-2 bg-slate-200 border-y-2 border-dark z-0 md:left-24 md:right-24" />

                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center flex-1 relative z-10 bg-white sm:px-4">
                            <div
                                className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center border-4 border-dark transition-all ${currentStep >= step.id
                                    ? 'bg-primary text-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                    : 'bg-white text-slate-400'
                                    }`}
                            >
                                {currentStep > step.id ? (
                                    <Check className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={4} />
                                ) : (
                                    <step.icon className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={3} />
                                )}
                            </div>
                            <span
                                className={`text-[10px] sm:text-xs mt-3 font-black uppercase tracking-widest ${currentStep >= step.id ? 'text-dark' : 'text-slate-400'
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
                        <div className="neu-card bg-white p-6 sm:p-8">
                            <h2 className="text-3xl font-black text-dark mb-4 uppercase tracking-tighter">Describe the Issue</h2>
                            <p className="text-dark font-bold mb-6 text-lg">
                                Tell us what's wrong with your {warranty.product_name}. Be as specific as possible.
                            </p>
                            <textarea
                                value={issueDescription}
                                onChange={(e) => setIssueDescription(e.target.value)}
                                placeholder="Example: My laptop won't turn on. The power button doesn't respond, and there's no LED indicator light..."
                                rows={6}
                                className="neu-input"
                            />
                            <div className="flex justify-end mt-8">
                                <GlowingButton
                                    onClick={() => setCurrentStep(2)}
                                    disabled={!issueDescription.trim()}
                                    className="py-4 px-8 text-xl"
                                >
                                    CONTINUE TO AI DIAGNOSIS
                                    <ArrowRight className="w-5 h-5 ml-2" strokeWidth={3} />
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
                        <div className="neu-card bg-white overflow-hidden p-0">
                            <h2 className="text-2xl font-black text-dark uppercase p-4 border-b-4 border-dark bg-secondary">AI Diagnostic Assistant</h2>
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
                                className="px-6 py-4 bg-white border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-dark font-black uppercase transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5" strokeWidth={3} />
                                BACK
                            </button>
                            <GlowingButton
                                onClick={handleGenerateEmail}
                                disabled={conversation.length < 2 || loading}
                                isLoading={loading}
                                className="py-4 flex-1 sm:flex-none justify-center"
                            >
                                GENERATE CLAIM EMAIL
                                <ArrowRight className="w-5 h-5 ml-2" strokeWidth={3} />
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
                        {/* Note: ClaimEmailPreview component inside needs separate refactor if it has glassmorphism. For now we wrap in a stark container */}
                        <div className="neu-card bg-white overflow-hidden p-0">
                            <h2 className="text-2xl font-black text-dark uppercase p-4 border-b-4 border-dark bg-secondary">Review Claim Email</h2>
                            <div className="p-4 sm:p-6 bg-slate-50">
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
                                className="px-6 py-4 bg-white border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-dark font-black uppercase transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5" strokeWidth={3} />
                                BACK TO CHAT
                            </button>
                            <GlowingButton
                                onClick={handleSubmitClaim}
                                disabled={!manufacturerEmail || submitting}
                                isLoading={submitting}
                                className="py-4 flex-1 sm:flex-none justify-center"
                            >
                                <Send className="w-5 h-5 mr-2" strokeWidth={3} />
                                SUBMIT CLAIM
                            </GlowingButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
