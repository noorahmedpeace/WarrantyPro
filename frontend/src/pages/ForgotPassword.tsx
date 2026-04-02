import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginLayout } from '../components/layouts/LoginLayout';
import { GlowingButton } from '../components/ui/GlowingButton';

export const ForgotPassword = () => {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'missing' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const result = await forgotPassword(email);
            setStatus('success');
            setMessage(result.message || 'If an account exists with that email, we have sent a password reset link. Please check your inbox.');
        } catch (err: any) {
            if (err?.status === 404) {
                setStatus('missing');
                setMessage(err.message || 'No WarrantyPro account was found with that email address.');
                return;
            }

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
                <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-950">
                        Check Your Inbox
                    </h3>
                    <p className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 text-sm font-medium text-slate-600">
                        {message}
                    </p>
                    <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-600">
                        <div className="flex items-center gap-2 font-semibold text-slate-950">
                            <ShieldCheck className="h-4 w-4 text-sky-600" />
                            What to expect
                        </div>
                        <p className="mt-2 leading-6">WarrantyPro sends a reset link, not a one-time code. Open the email and tap the reset button to continue.</p>
                    </div>
                    <Link to="/login" className="inline-block rounded-xl border border-slate-950 bg-slate-950 px-8 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5">
                        Back to Login
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-[1.25rem] border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-600">
                        <div className="flex items-center gap-2 font-semibold text-slate-950">
                            <Mail className="h-4 w-4 text-sky-600" />
                            Email-based reset flow
                        </div>
                        <p className="mt-1 leading-6">We will email you a secure reset link. There is no separate verification code in the current flow.</p>
                    </div>

                    {status === 'missing' && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                                <div>
                                    <p className="text-sm font-semibold text-amber-800">{message}</p>
                                    <p className="mt-1 text-sm leading-6 text-amber-700">
                                        Double-check the email you used for WarrantyPro, or create a new account if you have not signed up yet.
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-3">
                                        <Link
                                            to="/signup"
                                            className="inline-flex items-center rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100"
                                        >
                                            Create Account
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStatus('idle');
                                                setMessage('');
                                            }}
                                            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100"
                                        >
                                            Try another email
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                            <p className="text-sm font-medium text-red-700">{message}</p>
                        </div>
                    )}

                    <div className="space-y-2 group">
                        <label className="ml-1 text-sm font-semibold text-slate-700">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
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
                            className="w-full py-3.5 text-base"
                            isLoading={status === 'loading'}
                        >
                            Send Reset Link
                        </GlowingButton>
                    </div>

                    <div className="pt-6 text-center">
                        <Link to="/login" className="inline-flex items-center gap-2 font-medium text-slate-600 transition-colors hover:text-slate-950">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Login
                        </Link>
                    </div>
                </form>
            )}
        </LoginLayout>
    );
};
