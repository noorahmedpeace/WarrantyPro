import React from 'react';
import { Shield, Zap, Bell, CheckCircle2, Lock } from 'lucide-react';

interface LoginLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen flex bg-background">
            {/* Left Side - Brand Experience (Hidden on mobile, visible on lg+) */}
            <div className="hidden lg:flex w-1/2 relative bg-secondary border-r-4 border-dark overflow-hidden items-center justify-center p-12">
                
                {/* Decorative Geometric Element */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-primary border-4 border-dark shadow-neu rounded-full animate-bounce"></div>
                <div className="absolute bottom-10 left-10 w-40 h-40 bg-accent border-4 border-dark shadow-neu transform rotate-45"></div>

                <div className="relative z-10 max-w-lg text-left bg-white p-8 border-4 border-dark shadow-neu">
                    {/* Brand Logo/Icon */}
                    <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-primary border-4 border-dark shadow-neu">
                        <Shield className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-5xl font-black text-dark mb-6 uppercase tracking-tight">
                        Warranty<br />Management,<br />
                        <span className="text-primary bg-yellow-100 px-2">Reimagined.</span>
                    </h1>

                    <p className="text-xl text-dark font-medium mb-12 leading-relaxed border-l-4 border-primary pl-4">
                        Never lose a receipt again. Get AI-powered support, smart expiry alerts, and track all your devices in one secure vault.
                    </p>

                    {/* Feature List */}
                    <div className="space-y-4">
                        <FeatureItem
                            icon={<Zap className="w-6 h-6 text-dark" />}
                            text="AI-Powered Diagnostics"
                            desc="Instant troubleshooting for your devices."
                            bgClass="bg-accent"
                        />
                        <FeatureItem
                            icon={<Bell className="w-6 h-6 text-dark" />}
                            text="Smart Expiry Alerts"
                            desc="Get notified before your warranty ends."
                            bgClass="bg-primary"
                        />
                        <FeatureItem
                            icon={<CheckCircle2 className="w-6 h-6 text-dark" />}
                            text="Centralized Vault"
                            desc="All your receipts, organized and secure."
                            bgClass="bg-white"
                        />
                    </div>

                    {/* Trust Indicator */}
                    <div className="mt-8 flex items-center gap-4 text-sm font-bold text-dark border-t-4 border-dark pt-4">
                        <div className="flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            <span>BANK-LEVEL ENCRYPTION</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-dark" />
                        <span>500+ ACTIVE USERS</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Interaction */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative">
                <div className="w-full max-w-md z-10 neu-card p-6 sm:p-10">
                    {/* Mobile Hero Section (only visible on small screens) */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary border-4 border-dark shadow-neu mb-4">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-dark mb-2 uppercase">
                            WarrantyPro
                        </h1>
                        <p className="text-dark font-bold text-lg bg-secondary inline-block px-2 border-2 border-dark">
                            AI-powered tracking
                        </p>
                    </div>

                    <div className="text-center lg:text-left mb-8 border-b-4 border-dark pb-4">
                        <h2 className="text-3xl font-black text-dark mb-2 uppercase">{title}</h2>
                        <p className="text-dark font-medium">{subtitle}</p>
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
const FeatureItem = ({ icon, text, desc, bgClass }: { icon: React.ReactNode, text: string, desc: string, bgClass: string }) => (
    <div className={`flex items-start gap-4 p-4 border-4 border-dark shadow-neu transition-transform hover:-translate-y-1 hover:translate-x-1 ${bgClass}`}>
        <div className="flex-shrink-0 mt-1 bg-white border-2 border-dark p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{icon}</div>
        <div>
            <h3 className="font-black text-dark text-lg uppercase">{text}</h3>
            <p className="text-dark font-medium text-sm">{desc}</p>
        </div>
    </div>
);
