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
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#1b3765_0%,#0a1220_48%,#04070d_100%)]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[7%] top-[8%] h-56 w-80 rounded-[2.5rem] border border-white/10 bg-[linear-gradient(145deg,rgba(35,61,108,0.34),rgba(8,15,28,0.12))]" />
                <div className="absolute right-[12%] top-[9%] h-24 w-24 rounded-full border border-[#d9c18a]/20 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.2),rgba(255,255,255,0.02))]" />
                <div className="absolute right-[10%] top-[18%] h-48 w-4 rotate-[32deg] rounded-full bg-[linear-gradient(180deg,#f1dba5_0%,#946a22_100%)] shadow-[0_18px_35px_rgba(0,0,0,0.25)]" />
                <div className="absolute bottom-[-12%] left-[-8%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(46,97,171,0.25),rgba(46,97,171,0.04),transparent_70%)]" />
            </div>

            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-8">
                <div className="grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
                    <div className="hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-10 backdrop-blur-xl lg:flex lg:flex-col lg:justify-between">
                        <div>
                            <div className="flex items-center gap-4">
                                <div className="rounded-[1.3rem] border border-[#e0c687]/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-2.5">
                                    <WarrantyProMark className="h-12 w-12" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-semibold tracking-[0.2em] text-white">WARRANTY PRO</h1>
                                        <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.9)] animate-pulse" />
                                    </div>
                                    <p className="mt-1 text-sm text-slate-300">Secure access to your modern warranty command center.</p>
                                </div>
                            </div>

                            <div className="mt-12">
                                <h2 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-white">
                                    Smart protection records with the calm of a premium operating system.
                                </h2>
                                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                                    Every receipt, alert, claim, and coverage milestone stays in one focused interface designed for speed, clarity, and trust.
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
                                    description="Prioritized reminders, amber flags, and at-a-glance card health for every device."
                                />
                                <FeatureCard
                                    icon={<Shield className="h-5 w-5" strokeWidth={1.9} />}
                                    title="Vault-grade organization"
                                    description="Protected records, clean exports, and a dashboard built to stay readable under pressure."
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                                <Lock className="h-4 w-4 text-[#f1ddb0]" strokeWidth={1.9} />
                                Bank-level encryption
                            </div>
                            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                                <Wifi className="h-4 w-4 text-[#f1ddb0]" strokeWidth={1.9} />
                                Cloud synced
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="w-full max-w-xl rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,21,36,0.82),rgba(8,14,24,0.9))] p-6 shadow-[0_40px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:p-8">
                            <div className="rounded-[1.85rem] border border-[#d8bc83]/20 bg-[linear-gradient(180deg,rgba(245,212,124,0.08),rgba(255,255,255,0.03))] px-5 py-4">
                                <div className="flex items-center gap-4 lg:hidden">
                                    <div className="rounded-[1rem] border border-[#e0c687]/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-2">
                                        <WarrantyProMark className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold tracking-[0.2em] text-white">WARRANTY PRO</div>
                                        <div className="mt-1 text-xs text-slate-300">Secure sign in</div>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
                                    <p className="mt-2 text-sm font-medium leading-6 text-slate-300">{subtitle}</p>
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
    <div className="flex items-start gap-4 rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 backdrop-blur-xl">
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-[1rem] border border-[#dabb7c]/25 bg-[linear-gradient(180deg,rgba(245,211,119,0.14),rgba(245,211,119,0.05))] text-[#f1ddb0]">
            {icon}
        </div>
        <div>
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
        </div>
    </div>
);
