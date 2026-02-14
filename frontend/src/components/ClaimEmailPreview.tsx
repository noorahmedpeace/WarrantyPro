import React from 'react';
import { Mail, Edit3, Copy, Check } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { useState } from 'react';

interface ClaimEmailPreviewProps {
    subject: string;
    body: string;
    warranty: any;
    onEdit: (field: 'subject' | 'body', value: string) => void;
    manufacturerEmail?: string;
    onManufacturerEmailChange?: (email: string) => void;
}

export const ClaimEmailPreview: React.FC<ClaimEmailPreviewProps> = ({
    subject,
    body,
    warranty,
    onEdit,
    manufacturerEmail = '',
    onManufacturerEmailChange
}) => {
    const [isEditingSubject, setIsEditingSubject] = useState(false);
    const [isEditingBody, setIsEditingBody] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const emailText = `Subject: ${subject}\n\nTo: ${manufacturerEmail || warranty.brand + ' Support'}\n\n${body}`;
        navigator.clipboard.writeText(emailText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-4">
            {/* Manufacturer Email Input */}
            <GlassCard className="p-4">
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Manufacturer Email
                </label>
                <input
                    type="email"
                    value={manufacturerEmail}
                    onChange={(e) => onManufacturerEmailChange?.(e.target.value)}
                    placeholder={`support@${warranty.brand.toLowerCase()}.com`}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-slate-500 mt-2">
                    Enter the manufacturer's support email address
                </p>
            </GlassCard>

            {/* Email Preview */}
            <GlassCard className="overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                            <Mail className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Claim Email Preview</h3>
                            <p className="text-xs text-slate-400">Review and edit before sending</p>
                        </div>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-slate-300 transition-colors flex items-center gap-2"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 text-green-400" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                Copy
                            </>
                        )}
                    </button>
                </div>

                {/* Email Content */}
                <div className="p-6 space-y-6">
                    {/* Subject */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                Subject
                            </label>
                            <button
                                onClick={() => setIsEditingSubject(!isEditingSubject)}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                <Edit3 className="w-3 h-3" />
                                {isEditingSubject ? 'Done' : 'Edit'}
                            </button>
                        </div>
                        {isEditingSubject ? (
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => onEdit('subject', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            />
                        ) : (
                            <p className="text-white font-medium">{subject}</p>
                        )}
                    </div>

                    {/* To */}
                    <div>
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2">
                            To
                        </label>
                        <p className="text-white">
                            {manufacturerEmail || `${warranty.brand} Support Team`}
                        </p>
                    </div>

                    {/* Body */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                Message
                            </label>
                            <button
                                onClick={() => setIsEditingBody(!isEditingBody)}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                <Edit3 className="w-3 h-3" />
                                {isEditingBody ? 'Done' : 'Edit'}
                            </button>
                        </div>
                        {isEditingBody ? (
                            <textarea
                                value={body}
                                onChange={(e) => onEdit('body', e.target.value)}
                                rows={12}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                            />
                        ) : (
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                                    {body}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Product Info Summary */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-blue-400 mb-3">Attached Information</h4>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <span className="text-slate-500">Product:</span>
                                <p className="text-white font-medium">{warranty.product_name}</p>
                            </div>
                            <div>
                                <span className="text-slate-500">Brand:</span>
                                <p className="text-white font-medium">{warranty.brand}</p>
                            </div>
                            <div>
                                <span className="text-slate-500">Purchase Date:</span>
                                <p className="text-white font-medium">
                                    {new Date(warranty.purchase_date).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <span className="text-slate-500">Warranty:</span>
                                <p className="text-white font-medium">{warranty.warranty_duration_months} months</p>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
