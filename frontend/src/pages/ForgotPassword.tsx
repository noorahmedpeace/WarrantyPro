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
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-covered bg-covered-wash">
                        <CheckCircle2 className="h-10 w-10 text-covered" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight text-ink">
                        Check Your Inbox
                    </h3>
                    <p className="rounded-control border border-rule bg-surface-raised p-4 text-sm font-medium text-ink-muted">
                        {message}
                    </p>
                    <div className="rounded-surface border border-rule bg-surface px-4 py-3 text-left text-sm text-ink-muted">
                        <div className="flex items-center gap-2 font-semibold text-ink">
                            <ShieldCheck className="h-4 w-4 text-accent" />
                            What to expect
                        </div>
                        <p className="mt-2 leading-6">WarrantyPro sends a reset link, not a one-time code. Open the email and tap the reset button to continue.</p>
                    </div>
                    <Link to="/login" className="inline-block rounded-control border border-accent bg-accent px-8 py-3.5 font-semibold text-on-accent transition-all hover:-translate-y-0.5">
                        Back to Login
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-surface border border-rule bg-surface-raised px-4 py-3 text-sm text-ink-muted">
                        <div className="flex items-center gap-2 font-semibold text-ink">
                            <Mail className="h-4 w-4 text-accent" />
                            Email-based reset flow
                        </div>
                        <p className="mt-1 leading-6">We will email you a secure reset link. There is no separate verification code in the current flow.</p>
                    </div>

                    {status === 'missing' && (
                        <div className="rounded-control border border-expiring bg-expiring-wash p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-expiring" />
                                <div>
                                    <p className="text-sm font-semibold text-expiring">{message}</p>
                                    <p className="mt-1 text-sm leading-6 text-expiring">
                                        Double-check the email you used for WarrantyPro, or create a new account if you have not signed up yet.
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-3">
                                        <Link
                                            to="/signup"
                                            className="inline-flex items-center rounded-full border border-expiring bg-surface px-4 py-2 text-sm font-semibold text-expiring transition-colors hover:bg-expiring-wash"
                                        >
                                            Create Account
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStatus('idle');
                                                setMessage('');
                                            }}
                                            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-expiring transition-colors hover:bg-expiring-wash"
                                        >
                                            Try another email
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex items-center gap-3 rounded-control border border-expired bg-expired-wash p-4">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 text-expired" />
                            <p className="text-sm font-medium text-expired">{message}</p>
                        </div>
                    )}

                    <div className="space-y-2 group">
                        <label className="ml-1 text-sm font-semibold text-ink-muted">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <Mail className="h-5 w-5 text-neutral group-focus-within:text-accent transition-colors" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="field-input w-full !pl-12"
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
                        <Link to="/login" className="inline-flex items-center gap-2 font-medium text-ink-muted transition-colors hover:text-ink">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Login
                        </Link>
                    </div>
                </form>
            )}
        </LoginLayout>
    );
};
