import React from 'react';
import { Check, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface ClaimTimelineProps {
    claim: any;
}

export const ClaimTimeline: React.FC<ClaimTimelineProps> = ({ claim }) => {
    const statusSteps = [
        { id: 'pending', label: 'Claim Submitted', icon: Clock },
        { id: 'in_progress', label: 'Under Review', icon: Clock },
        { id: claim.status === 'rejected' ? 'rejected' : 'approved', label: claim.status === 'rejected' ? 'Rejected' : 'Approved', icon: claim.status === 'rejected' ? XCircle : Check },
        ...(claim.status !== 'rejected' ? [{ id: 'completed', label: 'Resolved', icon: CheckCircle2 }] : []),
    ];

    const currentStepIndex = statusSteps.findIndex((step) => step.id === claim.status);

    return (
        <div className="space-y-4">
            {statusSteps.map((step, index) => {
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                const Icon = step.icon;

                return (
                    <div key={step.id} className="flex gap-4 items-start">
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                    isActive
                                        ? 'border-[#dabb7c]/28 bg-[linear-gradient(180deg,rgba(245,211,119,0.18),rgba(245,211,119,0.05))]'
                                        : isCompleted
                                            ? 'border-emerald-300/20 bg-emerald-500/10'
                                            : 'border-white/10 bg-white/5'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${
                                    isActive ? 'text-[#f0ddb0]' : isCompleted ? 'text-emerald-200' : 'text-slate-400'
                                }`} />
                            </div>
                            {index < statusSteps.length - 1 && (
                                <div className={`w-0.5 h-12 ${isCompleted ? 'bg-emerald-300/30' : 'bg-white/10'}`} />
                            )}
                        </div>
                        <div className="flex-1 pb-8">
                            <h4 className={`font-bold ${isActive ? 'text-white' : isCompleted ? 'text-emerald-200' : 'text-slate-400'}`}>
                                {step.label}
                            </h4>
                            {isActive && (
                                <p className="text-sm text-slate-300 mt-1">
                                    {claim.status === 'pending' && 'Your claim is being processed'}
                                    {claim.status === 'in_progress' && `Service center: ${claim.service_center || 'To be assigned'}`}
                                    {claim.status === 'approved' && `Estimated resolution: ${claim.estimated_resolution ? formatDate(claim.estimated_resolution) : 'TBD'}`}
                                    {claim.status === 'rejected' && 'The claim was not approved'}
                                    {claim.status === 'completed' && 'Your claim has been successfully resolved'}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
