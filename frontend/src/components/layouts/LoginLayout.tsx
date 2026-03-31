import React from 'react';
import { Shield, Zap, Bell, CheckCircle2, Lock } from 'lucide-react';

interface LoginLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen flex bg-slate-50 relative overflow-hidden">
            {/* Background glowing orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px]" />

            {/* Left Side - Brand Experience (Hidden on mobile, visible on lg+) */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-center p-16 z-10 border-r border-slate-200/50 bg-white/40 backdrop-blur-3xl">
                <div className="max-w-xl">
                    {/* Brand Logo/Icon */}
                    <div className="mb-8 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/30">
                        <Shield className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                        Warranty Management,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Reimagined.</span>
                    </h1>

                    <p className="text-xl text-slate-600 font-medium mb-12 leading-relaxed max-w-lg">
                        Never lose a receipt again. Get AI-powered support, smart expiry alerts, and track all your devices in one highly secure vault.
                    </p>

                    {/* Feature List */}
                    <div className="space-y-4">
                        <FeatureItem
                            icon={<Zap className="w-6 h-6 text-primary" />}
                            text="AI-Powered Diagnostics"
                            desc="Instant troubleshooting for your devices."
                        />
                        <FeatureItem
                            icon={<Bell className="w-6 h-6 text-emerald-500" />}
                            text="Smart Expiry Alerts"
                            desc="Get notified before your warranty ends."
                        />
                        <FeatureItem
                            icon={<CheckCircle2 className="w-6 h-6 text-blue-500" />}
                            text="Centralized Vault"
                            desc="All your receipts, organized and secure."
                        />
                    </div>

                    {/* Trust Indicator */}
                    <div className="mt-12 flex items-center gap-4 text-sm font-semibold text-slate-500">
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-slate-400" />
                            <span>Bank-level Encryption</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <span>500+ Active Users</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Interaction */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10">
                <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                    {/* Mobile Hero Section (only visible on small screens) */}
                    <div className="lg:hidden text-center mb-8 flex flex-col items-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/30 mb-6">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
                            WarrantyPro
                        </h1>
                        <p className="text-primary font-semibold text-sm bg-primary/10 inline-block px-3 py-1 rounded-full">
                            AI-powered tracking
                        </p>
                    </div>

                    <div className="text-center lg:text-left mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">{title}</h2>
                        <p className="text-slate-500 font-medium text-sm">{subtitle}</p>
                    </div>

                    <div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Component for Features
const FeatureItem = ({ icon, text, desc }: { icon: React.ReactNode, text: string, desc: string }) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="flex-shrink-0 mt-0.5 w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-slate-900 text-base">{text}</h3>
            <p className="text-slate-500 font-medium text-sm mt-0.5 leading-relaxed">{desc}</p>
        </div>
    </div>
);
