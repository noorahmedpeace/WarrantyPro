import React from 'react';
import { Bell, Shield, Sparkles } from 'lucide-react';
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
                                    Your receipts expire. You find out too late.
                                </h2>
                                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                                    Photograph the receipt once. We read the date and tell you before the
                                    cover runs out.
                                </p>
                            </div>

                            <div className="mt-10 grid gap-4">
                                <FeatureCard
                                    icon={<Bell className="h-5 w-5" strokeWidth={1.9} />}
                                    title="Told 30 days before cover ends"
                                    description="An email while you can still do something about it, not after."
                                />
                                <FeatureCard
                                    icon={<Sparkles className="h-5 w-5" strokeWidth={1.9} />}
                                    title="A drafted claim you can edit"
                                    description="Describe the fault and get a written claim email. You read it before it sends."
                                />
                                <FeatureCard
                                    icon={<Shield className="h-5 w-5" strokeWidth={1.9} />}
                                    title="Receipt, serial and dates on one record"
                                    description="The things a manufacturer asks for, in the place you will look for them."
                                />
                            </div>
                        </div>

                        {/* The usage counters and the "bank-level encryption" claim that used to sit
                            here were not true, so they are gone. Anything that replaces them has to be
                            a fact someone could check. */}
                        <div className="mt-10">
                            <p className="text-sm leading-7 text-slate-600">
                                Passwords are hashed with bcrypt and never stored in readable form.
                                Your records are only visible to your own account.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="page-section w-full max-w-xl p-[1px]">
                            <div className="rounded-[calc(2.2rem-1px)] bg-white p-6 sm:p-8">
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
    <div className="row-interactive rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4">
        <div className="flex items-start gap-4">
            <div className="mt-0.5 rounded-full bg-sky-50 p-2.5 text-sky-600">{icon}</div>
            <div>
                <h3 className="text-base font-semibold text-slate-950">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
            </div>
        </div>
    </div>
);
