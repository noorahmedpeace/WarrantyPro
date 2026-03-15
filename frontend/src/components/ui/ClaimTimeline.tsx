import React from 'react';
import { Check, Clock, XCircle, CheckCircle2 } from 'lucide-react';
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

    const currentStepIndex = statusSteps.findIndex(s => s.id === claim.status);

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
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isActive
                                    ? 'bg-blue-50 border-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                    : isCompleted
                                        ? 'bg-emerald-50 border-emerald-200'
                                        : 'bg-slate-50 border-slate-200'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : isCompleted ? 'text-emerald-500' : 'text-slate-400'}`} />
                            </div>
                            {index < statusSteps.length - 1 && (
                                <div className={`w-0.5 h-12 ${isCompleted ? 'bg-emerald-200' : 'bg-slate-200'}`} />
                            )}
                        </div>
                        <div className="flex-1 pb-8">
                            <h4 className={`font-semibold ${isActive ? 'text-slate-900' : isCompleted ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {step.label}
                            </h4>
                            {isActive && (
                                <p className="text-sm text-slate-600 mt-1 font-medium">
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
