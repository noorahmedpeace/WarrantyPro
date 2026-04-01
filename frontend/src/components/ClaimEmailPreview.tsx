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
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                    Manufacturer Email
                </label>
                <input
                    type="email"
                    value={manufacturerEmail}
                    onChange={(e) => onManufacturerEmailChange?.(e.target.value)}
                    placeholder={`support@${String(warranty.brand || '').toLowerCase()}.com`}
                    className="neu-input w-full"
                />
                <p className="mt-2 text-xs text-slate-500">Enter the manufacturer&apos;s support email address</p>
            </GlassCard>

            <GlassCard className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg border border-sky-200 bg-sky-50 p-2 text-sky-600">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-950">Claim Email Preview</h3>
                            <p className="text-xs text-slate-500">Review and edit before sending</p>
                        </div>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-[#f8fafc] px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 text-emerald-600" />
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

                <div className="space-y-6 p-6">
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
                        <p className="font-medium text-slate-900">{subject}</p>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                            To
                        </label>
                        <p className="text-slate-900">{manufacturerEmail || `${warranty.brand} Support Team`}</p>
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
                            <div className="rounded-lg border border-slate-200 bg-[#f8fafc] p-4">
                                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
                                    {body}
                                </pre>
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                        <h4 className="mb-3 text-sm font-bold text-sky-700">Attached Information</h4>
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
    <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">{label}</label>
        <button onClick={onToggle} className="flex items-center gap-1 text-xs text-sky-600 hover:text-slate-950">
            <Edit3 className="w-3 h-3" />
            {editing ? 'Done' : 'Edit'}
        </button>
    </div>
);

const Detail = ({ label, value }: { label: string; value: string }) => (
    <div>
        <span className="text-slate-500">{label}:</span>
        <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
);
