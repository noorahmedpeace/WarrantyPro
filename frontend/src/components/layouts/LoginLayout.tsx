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
        <div className="min-h-screen bg-surface">
            <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-8">
                <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
                    <div className="hidden rounded-surface border border-rule bg-surface-raised p-10 shadow-raised lg:flex lg:flex-col lg:justify-between">
                        <div>
                            <div className="flex items-center gap-4">
                                <div className="rounded-surface bg-accent p-3 text-on-accent">
                                    <WarrantyProMark className="h-12 w-12" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-semibold tracking-[0.16em] text-ink">WARRANTY PRO</h1>
                                        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                                    </div>
                                    <p className="mt-1 text-sm text-ink-muted">Secure access to your warranty workspace.</p>
                                </div>
                            </div>

                            <div className="mt-12">
                                <h2 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-ink">
                                    Your receipts expire. You find out too late.
                                </h2>
                                <p className="mt-6 max-w-xl text-lg leading-8 text-ink-muted">
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
                            <p className="text-sm leading-7 text-ink-muted">
                                Passwords are hashed with bcrypt and never stored in readable form.
                                Your records are only visible to your own account.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="page-section w-full max-w-xl p-[1px]">
                            <div className="rounded-[calc(2.2rem-1px)] bg-surface p-6 sm:p-8">
                            <div className="rounded-surface bg-surface-raised px-5 py-4">
                                <div className="flex items-center gap-4 lg:hidden">
                                    <div className="rounded-control bg-accent p-2.5 text-on-accent">
                                        <WarrantyProMark className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold tracking-[0.16em] text-ink">WARRANTY PRO</div>
                                        <div className="mt-1 text-xs text-ink-muted">Secure sign in</div>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h2>
                                    <p className="mt-2 text-sm font-medium leading-6 text-ink-muted">{subtitle}</p>
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
    <div className="row-interactive rounded-surface border border-rule bg-surface px-5 py-4">
        <div className="flex items-start gap-4">
            <div className="mt-0.5 rounded-full bg-accent-wash p-2.5 text-accent">{icon}</div>
            <div>
                <h3 className="text-base font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-muted">{description}</p>
            </div>
        </div>
    </div>
);
