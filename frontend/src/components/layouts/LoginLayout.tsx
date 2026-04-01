import React from 'react';
import { Bell, Lock, Shield, Sparkles, Wifi } from 'lucide-react';
import { WarrantyProMark } from '../HeritageIcons';

interface LoginLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-8">
                <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
                    <div className="hidden rounded-[2.4rem] border border-slate-200 bg-[#f8fafc] p-10 shadow-[0_18px_38px_rgba(15,23,42,0.05)] lg:flex lg:flex-col lg:justify-between">
                        <div>
                            <div className="flex items-center gap-4">
                                <div className="rounded-[1.3rem] bg-slate-950 p-3 text-white">
                                    <WarrantyProMark className="h-12 w-12" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-semibold tracking-[0.16em] text-slate-950">WARRANTY PRO</h1>
                                        <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                                    </div>
                                    <p className="mt-1 text-sm text-slate-600">Secure access to your warranty workspace.</p>
                                </div>
                            </div>

                            <div className="mt-12">
                                <h2 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950">
                                    Smart protection records with the calm of a clean modern product.
                                </h2>
                                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                                    Every receipt, alert, claim, and coverage milestone stays in one focused interface designed for clarity and trust.
                                </p>
                            </div>

                            <div className="mt-10 grid gap-4">
                                <FeatureCard
                                    icon={<Sparkles className="h-5 w-5" strokeWidth={1.9} />}
                                    title="Guided claim workflows"
                                    description="AI diagnosis, communication prep, and one-place tracking for every next step."
                                />
                                <FeatureCard
                                    icon={<Bell className="h-5 w-5" strokeWidth={1.9} />}
                                    title="Live expiry intelligence"
                                    description="Prioritized reminders and at-a-glance health for every protected product."
                                />
                                <FeatureCard
                                    icon={<Shield className="h-5 w-5" strokeWidth={1.9} />}
                                    title="Vault-grade organization"
                                    description="Protected records, clean exports, and a dashboard that stays readable under pressure."
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
                                <Lock className="h-4 w-4 text-sky-500" strokeWidth={1.9} />
                                Bank-level encryption
                            </div>
                            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
                                <Wifi className="h-4 w-4 text-sky-500" strokeWidth={1.9} />
                                Cloud synced
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="w-full max-w-xl rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_38px_rgba(15,23,42,0.06)] sm:p-8">
                            <div className="rounded-[1.75rem] bg-[#f8fafc] px-5 py-4">
                                <div className="flex items-center gap-4 lg:hidden">
                                    <div className="rounded-[1rem] bg-slate-950 p-2.5 text-white">
                                        <WarrantyProMark className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold tracking-[0.16em] text-slate-950">WARRANTY PRO</div>
                                        <div className="mt-1 text-xs text-slate-600">Secure sign in</div>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
                                    <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{subtitle}</p>
                                </div>
                            </div>

                            <div className="mt-6">{children}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) => (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4">
        <div className="flex items-start gap-4">
            <div className="mt-0.5 rounded-full bg-sky-50 p-2.5 text-sky-600">{icon}</div>
            <div>
                <h3 className="text-base font-semibold text-slate-950">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
            </div>
        </div>
    </div>
);
