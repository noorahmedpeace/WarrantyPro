import React from 'react';
import { Shield, Zap, Bell, CheckCircle2, Lock } from 'lucide-react';

interface LoginLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950">
            {/* Left Side - Brand Experience (Hidden on mobile, visible on lg+) */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center p-12">
                {/* Background Gradients with Animation */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900 z-0" />
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl opacity-50 animate-pulse"
                    style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl opacity-30 animate-pulse"
                    style={{ animationDuration: '6s', animationDelay: '1s' }} />

                <div className="relative z-10 max-w-lg text-left">
                    {/* Brand Logo/Icon with Bounce Animation */}
                    <div className="mb-8 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 shadow-lg shadow-purple-500/30 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Shield className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-5xl font-bold text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        Warranty Management, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-[length:200%_auto] animate-gradient">
                            Reimagined.
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        Never lose a receipt again. Get AI-powered support, smart expiry alerts, and track all your devices in one secure vault.
                    </p>

                    {/* Feature List with Staggered Animation */}
                    <div className="space-y-6">
                        <FeatureItem
                            icon={<Zap className="w-6 h-6 text-yellow-400" />}
                            text="AI-Powered Diagnostics"
                            desc="Instant troubleshooting for your devices."
                            delay="delay-300"
                        />
                        <FeatureItem
                            icon={<Bell className="w-6 h-6 text-red-400" />}
                            text="Smart Expiry Alerts"
                            desc="Get notified before your warranty ends."
                            delay="delay-500"
                        />
                        <FeatureItem
                            icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                            text="Centralized Vault"
                            desc="All your receipts, organized and secure."
                            delay="delay-700"
                        />
                    </div>

                    {/* Trust Indicator */}
                    <div className="mt-12 flex items-center gap-4 text-sm text-slate-500 animate-in fade-in duration-700 delay-1000">
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            <span>Bank-level encryption</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                        <span>500+ active users</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Interaction */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 relative min-h-screen">
                {/* Mobile Background Gradient (only visible on small screens) */}
                <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-indigo-900/20 to-slate-950 z-0" />

                <div className="w-full max-w-md z-10">
                    {/* Mobile Hero Section (only visible on small screens) */}
                    <div className="lg:hidden text-center mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 shadow-lg shadow-purple-500/30 mb-4">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-[length:200%_auto] animate-gradient">
                                WarrantyPro
                            </span>
                        </h1>
                        <p className="text-xs text-slate-400 mb-6">
                            AI-powered warranty tracking & support
                        </p>

                        {/* Mobile Feature Pills */}
                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                                <span>AI Diagnostics</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                                <Bell className="w-3.5 h-3.5 text-red-400" />
                                <span>Smart Alerts</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Secure Vault</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center lg:text-left mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
                        <p className="text-slate-400">{subtitle}</p>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                        {children}
                    </div>
                </div>
            </div>

            {/* Global CSS for animated gradient */}
            <style>{`
                @keyframes gradient {
                    0%, 100% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                }
                .animate-gradient {
                    animation: gradient 4s ease infinite;
                }
            `}</style>
        </div>
    );
};

// Helper Component for Features with Animation Delay
const FeatureItem = ({ icon, text, desc, delay }: { icon: React.ReactNode, text: string, desc: string, delay: string }) => (
    <div className={`flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/10 hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-left-4 ${delay}`}>
        <div className="flex-shrink-0 mt-1">{icon}</div>
        <div>
            <h3 className="font-semibold text-white text-lg">{text}</h3>
            <p className="text-slate-400 text-sm">{desc}</p>
        </div>
    </div>
);
