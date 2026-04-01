import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginLayout } from '../components/layouts/LoginLayout';
import { GlowingButton } from '../components/ui/GlowingButton';

export const ForgotPassword = () => {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            await forgotPassword(email);
            setStatus('success');
            setMessage('If an account exists with that email, we have sent a password reset link. Please check your inbox.');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Failed to send reset link.');
        }
    };

    return (
        <LoginLayout
            title="RESET PASSWORD"
            subtitle="Enter your email to receive a secure reset link"
        >
            {status === 'success' ? (
                <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-20 h-20 bg-emerald-500/12 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-300/20">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                        Check Your Inbox
                    </h3>
                    <p className="bg-white/5 border border-white/10 rounded-xl p-4 font-medium text-slate-300 text-sm">
                        {message}
                    </p>
                    <Link to="/login" className="inline-block px-8 py-3.5 font-semibold rounded-xl text-[#241606] border border-[#e2c68b]/35 bg-[linear-gradient(180deg,#f8e1b3_0%,#c89236_100%)] shadow-[0_14px_26px_rgba(208,158,65,0.24)] transition-all hover:-translate-y-0.5">
                        Back to Login
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {status === 'error' && (
                        <div className="p-4 rounded-xl border border-red-300/20 bg-red-500/10 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-red-100 font-medium text-sm">{message}</p>
                        </div>
                    )}

                    <div className="space-y-2 group">
                        <label className="text-sm font-semibold text-slate-200 ml-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-[#f0ddb0] transition-colors" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="neu-input w-full !pl-12"
                                placeholder="you@example.com"
                                disabled={status === 'loading'}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <GlowingButton
                            type="submit"
                            className="w-full text-base py-3.5"
                            isLoading={status === 'loading'}
                        >
                            Send Reset Link
                        </GlowingButton>
                    </div>

                    <div className="text-center pt-6">
                        <Link to="/login" className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-medium transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </form>
            )}
        </LoginLayout>
    );
};
