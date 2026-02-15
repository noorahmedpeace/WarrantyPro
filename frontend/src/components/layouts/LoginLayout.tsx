import React from 'react';
import { Shield, Zap, Bell, CheckCircle2 } from 'lucide-react';

interface LoginLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen flex bg-slate-950">
            {/* Left Side - Brand Experience (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center p-12">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900 z-0" />
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl opacity-50 animate-pulse" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl opacity-30" />

                <div className="relative z-10 max-w-lg text-left">
                    {/* Brand Logo/Icon */}
                    <div className="mb-8 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 shadow-lg shadow-purple-500/30">
                        <Shield className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                        Warranty Management, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Reimagined.
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 mb-12 leading-relaxed">
                        Never lose a receipt again. Get AI-powered support, smart expiry alerts, and track all your devices in one secure vault.
                    </p>

                    {/* Feature List */}
                    <div className="space-y-6">
                        <FeatureItem
                            icon={<Zap className="w-6 h-6 text-yellow-400" />}
                            text="AI-Powered Diagnostics"
                            desc="Instant troubleshooting for your devices."
                        />
                        <FeatureItem
                            icon={<Bell className="w-6 h-6 text-red-400" />}
                            text="Smart Expiry Alerts"
                            desc="Get notified before your warranty ends."
                        />
                        <FeatureItem
                            icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                            text="Centralized Vault"
                            desc="All your receipts, organized and secure."
                        />
                    </div>
                </div>
            </div>

            {/* Right Side - Form Interaction */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative">
                {/* Mobile Background Gradient (only visible on small screens) */}
                <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-indigo-900/20 to-slate-950 z-0" />

                <div className="w-full max-w-md z-10">
                    <div className="text-center lg:text-left mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
                        <p className="text-slate-400">{subtitle}</p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
};

// Helper Component for Features
const FeatureItem = ({ icon, text, desc }: { icon: React.ReactNode, text: string, desc: string }) => (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
        <div className="flex-shrink-0 mt-1">{icon}</div>
        <div>
            <h3 className="font-semibold text-white text-lg">{text}</h3>
            <p className="text-slate-400 text-sm">{desc}</p>
        </div>
    </div>
);
