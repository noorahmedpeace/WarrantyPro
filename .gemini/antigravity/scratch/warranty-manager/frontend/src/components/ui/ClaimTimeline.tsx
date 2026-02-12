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
                                    ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                    : isCompleted
                                        ? 'bg-green-500/20 border-green-500'
                                        : 'bg-white/5 border-white/10'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-slate-500'}`} />
                            </div>
                            {index < statusSteps.length - 1 && (
                                <div className={`w-0.5 h-12 ${isCompleted ? 'bg-green-500/30' : 'bg-white/10'}`} />
                            )}
                        </div>
                        <div className="flex-1 pb-8">
                            <h4 className={`font-bold ${isActive ? 'text-white' : isCompleted ? 'text-green-300' : 'text-slate-500'}`}>
                                {step.label}
                            </h4>
                            {isActive && (
                                <p className="text-sm text-slate-400 mt-1">
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
