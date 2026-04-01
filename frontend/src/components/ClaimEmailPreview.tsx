import React, { useState } from 'react';
import { Check, Copy, Edit3, Mail } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

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
    onManufacturerEmailChange,
}) => {
    const [isEditingSubject, setIsEditingSubject] = useState(false);
    const [isEditingBody, setIsEditingBody] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const emailText = `Subject: ${subject}\n\nTo: ${manufacturerEmail || `${warranty.brand} Support`}\n\n${body}`;
        navigator.clipboard.writeText(emailText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-4">
            <GlassCard className="p-4">
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-[0.22em] mb-2">
                    Manufacturer Email
                </label>
                <input
                    type="email"
                    value={manufacturerEmail}
                    onChange={(e) => onManufacturerEmailChange?.(e.target.value)}
                    placeholder={`support@${String(warranty.brand || '').toLowerCase()}.com`}
                    className="neu-input w-full"
                />
                <p className="text-xs text-slate-400 mt-2">
                    Enter the manufacturer&apos;s support email address
                </p>
            </GlassCard>

            <GlassCard className="overflow-hidden">
                <div className="border-b border-white/10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg border border-[#dabb7c]/25 bg-[linear-gradient(180deg,rgba(245,211,119,0.14),rgba(245,211,119,0.05))] p-2 text-[#f0ddb0]">
                            <Mail className="w-5 h-5" />
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
                                <Check className="w-4 h-4 text-emerald-300" />
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

                <div className="p-6 space-y-6">
                    <FieldHeader
                        label="Subject"
                        editing={isEditingSubject}
                        onToggle={() => setIsEditingSubject(!isEditingSubject)}
                    />
                    {isEditingSubject ? (
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => onEdit('subject', e.target.value)}
                            className="neu-input w-full"
                        />
                    ) : (
                        <p className="text-white font-medium">{subject}</p>
                    )}

                    <div>
                        <label className="text-sm font-bold text-slate-300 uppercase tracking-[0.22em] block mb-2">
                            To
                        </label>
                        <p className="text-white">{manufacturerEmail || `${warranty.brand} Support Team`}</p>
                    </div>

                    <div>
                        <FieldHeader
                            label="Message"
                            editing={isEditingBody}
                            onToggle={() => setIsEditingBody(!isEditingBody)}
                        />
                        {isEditingBody ? (
                            <textarea
                                value={body}
                                onChange={(e) => onEdit('body', e.target.value)}
                                rows={12}
                                className="neu-input w-full resize-none"
                            />
                        ) : (
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                                    {body}
                                </pre>
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg border border-[#dabb7c]/20 bg-[linear-gradient(180deg,rgba(245,211,119,0.1),rgba(245,211,119,0.03))] p-4">
                        <h4 className="text-sm font-bold text-[#f0ddb0] mb-3">Attached Information</h4>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <Detail label="Product" value={warranty.product_name} />
                            <Detail label="Brand" value={warranty.brand} />
                            <Detail label="Purchase Date" value={new Date(warranty.purchase_date).toLocaleDateString()} />
                            <Detail label="Warranty" value={`${warranty.warranty_duration_months} months`} />
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

const FieldHeader = ({
    label,
    editing,
    onToggle,
}: {
    label: string;
    editing: boolean;
    onToggle: () => void;
}) => (
    <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-bold text-slate-300 uppercase tracking-[0.22em]">{label}</label>
        <button onClick={onToggle} className="text-xs text-[#f0ddb0] hover:text-white flex items-center gap-1">
            <Edit3 className="w-3 h-3" />
            {editing ? 'Done' : 'Edit'}
        </button>
    </div>
);

const Detail = ({ label, value }: { label: string; value: string }) => (
    <div>
        <span className="text-slate-400">{label}:</span>
        <p className="text-white font-medium mt-1">{value}</p>
    </div>
);
