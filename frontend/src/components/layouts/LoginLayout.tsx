import React from 'react';
import { Shield, Zap, Bell, CheckCircle2, Lock } from 'lucide-react';

interface LoginLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Side - Brand Experience (Hidden on mobile, visible on lg+) */}
            <div className="hidden lg:flex w-1/2 relative bg-auth-pattern overflow-hidden items-center justify-center p-12">
                
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                    <div className="absolute top-10 right-10 w-64 h-64 bg-accent/30 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 left-10 w-72 h-72 bg-secondary/30 rounded-full mix-blend-screen filter blur-3xl"></div>
                </div>

                <div className="relative z-10 max-w-lg text-left backdrop-blur-md bg-white/10 p-10 rounded-3xl border border-white/20 shadow-floating text-white">
                    {/* Brand Logo/Icon */}
                    <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl border border-white/30 shadow-soft">
                        <Shield className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">
                        Warranty<br />Management,<br />
                        <span className="text-accent-light">Reimagined.</span>
                    </h1>

                    <p className="text-lg text-slate-200 font-medium mb-12 leading-relaxed border-l-2 border-accent-light pl-4">
                        Never lose a receipt again. Get AI-powered support, smart expiry alerts, and track all your devices in one secure vault.
                    </p>

                    {/* Feature List */}
                    <div className="space-y-4">
                        <FeatureItem
                            icon={<Zap className="w-5 h-5 text-accent-light" />}
                            text="AI-Powered Diagnostics"
                            desc="Instant troubleshooting for your devices."
                        />
                        <FeatureItem
                            icon={<Bell className="w-5 h-5 text-secondary-light" />}
                            text="Smart Expiry Alerts"
                            desc="Get notified before your warranty ends."
                        />
                        <FeatureItem
                            icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                            text="Centralized Vault"
                            desc="All your receipts, organized and secure."
                        />
                    </div>

                    {/* Trust Indicator */}
                    <div className="mt-8 flex items-center gap-4 text-sm font-semibold text-slate-300 border-t border-white/20 pt-6">
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-emerald-400" />
                            <span>BANK-LEVEL ENCRYPTION</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>500+ ACTIVE USERS</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Interaction */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative bg-subtle-pattern">
                <div className="w-full max-w-md z-10 trust-card p-6 sm:p-10">
                    {/* Mobile Hero Section (only visible on small screens) */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-soft mb-4">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                            WarrantyPro
                        </h1>
                        <p className="text-secondary font-medium text-sm border border-secondary/20 bg-secondary/5 rounded-full px-3 py-1 inline-block">
                            Secure tracking & management
                        </p>
                    </div>

                    <div className="text-center lg:text-left mb-8 border-b border-slate-100 pb-6">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
                        <p className="text-slate-500 font-medium">{subtitle}</p>
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
    <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl transition-all hover:bg-white/10">
        <div className="flex-shrink-0 mt-1">{icon}</div>
        <div>
            <h3 className="font-semibold text-white text-base">{text}</h3>
            <p className="text-slate-300 font-medium text-sm">{desc}</p>
        </div>
    </div>
);
