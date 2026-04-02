import React from 'react';
import { motion } from 'framer-motion';
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
        <div className="space-y-3 sm:space-y-4">
            {statusSteps.map((step, index) => {
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                const Icon = step.icon;

                return (
                    <motion.div
                        key={step.id}
                        className="flex items-start gap-3 sm:gap-4"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all sm:h-10 sm:w-10 ${
                                    isActive
                                        ? 'border-sky-200 bg-sky-50 shadow-[0_12px_24px_rgba(56,189,248,0.12)]'
                                        : isCompleted
                                            ? 'border-emerald-200 bg-emerald-50'
                                            : 'border-slate-200 bg-white'
                                }`}
                            >
                                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                    isActive ? 'text-sky-600' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                                }`} />
                            </div>
                            {index < statusSteps.length - 1 && (
                                <div className={`h-10 w-0.5 sm:h-12 ${isCompleted ? 'bg-emerald-200' : isActive ? 'bg-sky-200' : 'bg-slate-200'}`} />
                            )}
                        </div>
                        <div className="flex-1 pb-6 sm:pb-8">
                            <h4 className={`text-sm font-bold sm:text-base ${isActive ? 'text-slate-950' : isCompleted ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {step.label}
                            </h4>
                            {isActive && (
                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                    {claim.status === 'pending' && 'Your claim is being processed'}
                                    {claim.status === 'in_progress' && `Service center: ${claim.service_center || 'To be assigned'}`}
                                    {claim.status === 'approved' && `Estimated resolution: ${claim.estimated_resolution ? formatDate(claim.estimated_resolution) : 'TBD'}`}
                                    {claim.status === 'rejected' && 'The claim was not approved'}
                                    {claim.status === 'completed' && 'Your claim has been successfully resolved'}
                                </p>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
