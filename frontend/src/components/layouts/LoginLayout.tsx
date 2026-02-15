import React from 'react';
import { Shield, Zap, Bell, CheckCircle2, Smartphone } from 'lucide-react';

interface LoginLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen flex bg-slate-950 relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float-slow opacity-30" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float-slower opacity-25" />
                <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl animate-float opacity-20" />
            </div>

            {/* Left Side - Brand Experience (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center p-12 z-10">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900" />

                <div className="relative z-10 max-w-lg text-left">
                    {/* Brand Logo/Icon with Glow */}
                    <div className="mb-8 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 shadow-lg shadow-purple-500/50 animate-pulse-glow">
                        <Shield className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                        Warranty Management, <br />
                        <span className="relative inline-block">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-shift animate-neon-glow">
                                Reimagined.
                            </span>
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer opacity-0 blur-sm" />
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 mb-12 leading-relaxed">
                        Never lose a receipt again. Get AI-powered support, smart expiry alerts, and track all your devices in one secure vault.
                    </p>

                    {/* Phone Mockup with Float Animation */}
                    <div className="mb-12 flex justify-center lg:justify-start">
                        <div className="relative animate-float-phone">
                            <div className="w-48 h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border-4 border-slate-700 shadow-2xl shadow-blue-500/30 animate-phone-glow p-3">
                                <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-purple-900/30 rounded-2xl flex items-center justify-center">
                                    <Smartphone className="w-12 h-12 text-blue-400/50" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature List with Enhanced Glassmorphism */}
                    <div className="space-y-4">
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
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10">
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

            {/* Custom CSS Animations */}
            <style>{`
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                @keyframes neon-glow {
                    0%, 100% {
                        filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.5))
                                drop-shadow(0 0 15px rgba(168, 85, 247, 0.3));
                    }
                    50% {
                        filter: drop-shadow(0 0 12px rgba(96, 165, 250, 0.7))
                                drop-shadow(0 0 20px rgba(168, 85, 247, 0.5));
                    }
                }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(100%); opacity: 0; }
                }
                
                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    33% { transform: translate(10px, -10px); }
                    66% { transform: translate(-10px, 10px); }
                }
                
                @keyframes float-slow {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(20px, -20px) scale(1.1); }
                }
                
                @keyframes float-slower {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-15px, 15px) scale(0.95); }
                }
                
                @keyframes float-phone {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                
                @keyframes phone-glow {
                    0%, 100% {
                        box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.25),
                                    0 0 30px rgba(168, 85, 247, 0.2);
                    }
                    50% {
                        box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.4),
                                    0 0 40px rgba(168, 85, 247, 0.35);
                    }
                }
                
                @keyframes pulse-glow {
                    0%, 100% {
                        box-shadow: 0 10px 25px -5px rgba(168, 85, 247, 0.3),
                                    0 0 20px rgba(168, 85, 247, 0.2);
                    }
                    50% {
                        box-shadow: 0 10px 25px -5px rgba(168, 85, 247, 0.5),
                                    0 0 30px rgba(168, 85, 247, 0.4);
                    }
                }
                
                .animate-gradient-shift {
                    background-size: 200% 200%;
                    animation: gradient-shift 3s ease infinite;
                }
                
                .animate-neon-glow {
                    animation: neon-glow 2s ease-in-out infinite;
                }
                
                .animate-shimmer {
                    animation: shimmer 3s ease-in-out infinite;
                    animation-delay: 1s;
                }
                
                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }
                
                .animate-float-slow {
                    animation: float-slow 12s ease-in-out infinite;
                }
                
                .animate-float-slower {
                    animation: float-slower 15s ease-in-out infinite;
                }
                
                .animate-float-phone {
                    animation: float-phone 3s ease-in-out infinite;
                }
                
                .animate-phone-glow {
                    animation: phone-glow 2s ease-in-out infinite;
                }
                
                .animate-pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

// Helper Component for Features with Enhanced Glassmorphism
const FeatureItem = ({ icon, text, desc }: { icon: React.ReactNode, text: string, desc: string }) => (
    <div className="group flex items-start gap-4 p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xl hover:bg-white/15 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer">
        <div className="flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <div>
            <h3 className="font-semibold text-white text-lg mb-1">{text}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    </div>
);
