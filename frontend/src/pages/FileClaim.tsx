import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { warrantiesApi } from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowingButton } from '../components/ui/GlowingButton';
import { DiagnosticChat } from '../components/DiagnosticChat';
import { ClaimEmailPreview } from '../components/ClaimEmailPreview';

const STEPS = [
    { id: 1, name: 'Describe Issue', icon: AlertTriangle },
    { id: 2, name: 'AI Diagnosis', icon: Check },
    { id: 3, name: 'Review Email', icon: Send },
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32 pt-8 px-4 max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-8">
                <button
                    onClick={() => navigate(`/warranties/${warranty._id}`)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Warranty
                </button>
                <h1 className="text-3xl font-bold text-white mb-2">File Warranty Claim</h1>
                <p className="text-slate-400">
                    {warranty.product_name} • {warranty.brand}
                </p>
            </header>

            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {STEPS.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center flex-1">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${currentStep >= step.id
                                        ? 'bg-blue-600 border-blue-500 text-white'
                                        : 'bg-white/5 border-white/10 text-slate-500'
                                        }`}
                                >
                                    {currentStep > step.id ? (
                                        <Check className="w-6 h-6" />
                                    ) : (
                                        <step.icon className="w-6 h-6" />
                                    )}
                                </div>
                                <span
                                    className={`text-xs mt-2 font-medium ${currentStep >= step.id ? 'text-white' : 'text-slate-500'
                                        }`}
                                >
                                    {step.name}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div
                                    className={`h-0.5 flex-1 mx-2 transition-all ${currentStep > step.id ? 'bg-blue-600' : 'bg-white/10'
                                        }`}
                                />
                            )}
                        </React.Fragment>
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
                        <GlassCard className="p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Describe the Issue</h2>
                            <p className="text-slate-400 mb-6">
                                Tell us what's wrong with your {warranty.product_name}. Be as specific as possible.
                            </p>
                            <textarea
                                value={issueDescription}
                                onChange={(e) => setIssueDescription(e.target.value)}
                                placeholder="Example: My laptop won't turn on. The power button doesn't respond, and there's no LED indicator light..."
                                rows={6}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                            />
                            <div className="flex justify-end mt-6">
                                <GlowingButton
                                    onClick={() => setCurrentStep(2)}
                                    disabled={!issueDescription.trim()}
                                >
                                    Continue to AI Diagnosis
                                    <ArrowRight className="w-4 h-4" />
                                </GlowingButton>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {currentStep === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <GlassCard className="overflow-hidden">
                            <div className="h-[600px]">
                                <DiagnosticChat
                                    warranty={warranty}
                                    onConversationUpdate={handleConversationUpdate}
                                    initialMessage={issueDescription}
                                />
                            </div>
                        </GlassCard>
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            <GlowingButton
                                onClick={handleGenerateEmail}
                                disabled={conversation.length < 2 || loading}
                                isLoading={loading}
                            >
                                Generate Claim Email
                                <ArrowRight className="w-4 h-4" />
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
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Chat
                            </button>
                            <GlowingButton
                                onClick={handleSubmitClaim}
                                disabled={!manufacturerEmail || submitting}
                                isLoading={submitting}
                            >
                                <Send className="w-4 h-4" />
                                Submit Claim
                            </GlowingButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
