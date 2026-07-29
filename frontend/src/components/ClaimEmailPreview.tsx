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
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.22em] text-neutral">
                    Manufacturer Email
                </label>
                <input
                    type="email"
                    value={manufacturerEmail}
                    onChange={(e) => onManufacturerEmailChange?.(e.target.value)}
                    placeholder={`support@${String(warranty.brand || '').toLowerCase()}.com`}
                    className="field-input w-full"
                />
                <p className="mt-2 text-xs text-neutral">Enter the manufacturer&apos;s support email address</p>
            </GlassCard>

            <GlassCard className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-rule p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-control border border-accent bg-accent-wash p-2 text-accent">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-ink">Claim Email Preview</h3>
                            <p className="text-xs text-neutral">Review and edit before sending</p>
                        </div>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 rounded-control border border-rule bg-surface-raised px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-raised"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 text-covered" />
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
                            className="field-input w-full"
                        />
                    ) : (
                        <p className="font-medium text-ink">{subject}</p>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.22em] text-neutral">
                            To
                        </label>
                        <p className="text-ink">{manufacturerEmail || `${warranty.brand} Support Team`}</p>
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
                                className="field-input w-full resize-none"
                            />
                        ) : (
                            <div className="rounded-control border border-rule bg-surface-raised p-4">
                                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-muted">
                                    {body}
                                </pre>
                            </div>
                        )}
                    </div>

                    <div className="rounded-control border border-accent bg-accent-wash p-4">
                        <h4 className="mb-3 text-sm font-bold text-accent">Attached Information</h4>
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
        <label className="text-sm font-bold uppercase tracking-[0.22em] text-neutral">{label}</label>
        <button onClick={onToggle} className="flex items-center gap-1 text-xs text-accent hover:text-ink">
            <Edit3 className="w-3 h-3" />
            {editing ? 'Done' : 'Edit'}
        </button>
    </div>
);

const Detail = ({ label, value }: { label: string; value: string }) => (
    <div>
        <span className="text-neutral">{label}:</span>
        <p className="mt-1 font-medium text-ink">{value}</p>
    </div>
);
