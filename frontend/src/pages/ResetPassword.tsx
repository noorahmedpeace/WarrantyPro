import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginLayout } from '../components/layouts/LoginLayout';
import { GlowingButton } from '../components/ui/GlowingButton';

export const ResetPassword = () => {
    const { resetPassword } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token || !email) {
            setStatus('error');
            setMessage('Invalid reset link. Please request a new one.');
        }
    }, [token, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters');
            return;
        }

        if (!token || !email) return;

        setStatus('loading');
        setMessage('');

        try {
            await resetPassword(email, token, password);
            setStatus('success');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Failed to reset password.');
        }
    };

    if (!token || !email) {
        return (
            <LoginLayout title="INVALID LINK" subtitle="This password reset link is invalid or expired">
                <div className="space-y-8 text-center">
                    <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-6">
                        <AlertCircle className="h-12 w-12 text-red-500" strokeWidth={2.5} />
                        <p className="text-center text-lg font-bold text-red-700">We couldn't verify your request.</p>
                        <p className="text-center text-sm font-medium text-red-600">Please request a new link.</p>
                    </div>
                    <Link to="/forgot-password" className="inline-block rounded-xl border border-slate-950 bg-slate-950 px-8 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5">
                        Request New Link
                    </Link>
                </div>
            </LoginLayout>
        );
    }

    return (
        <LoginLayout
            title="CREATE NEW PASSWORD"
            subtitle={`Resetting password for ${email}`}
        >
            {status === 'success' ? (
                <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-950">
                        Password Reset!
                    </h3>
                    <p className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 text-sm font-medium text-slate-600">
                        Your password has been successfully updated. Redirecting you to login...
                    </p>
                    <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border border-slate-950 bg-slate-950 px-8 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5">
                        Login Now <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {status === 'error' && (
                        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                            <p className="text-sm font-medium text-red-700">{message}</p>
                        </div>
                    )}

                    <div className="space-y-2 group">
                        <label className="ml-1 text-sm font-semibold text-slate-700">
                            New Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="neu-input w-full !pl-12"
                                placeholder="Create a new password"
                                disabled={status === 'loading'}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <label className="ml-1 text-sm font-semibold text-slate-700">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                            </div>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="neu-input w-full !pl-12"
                                placeholder="Confirm your new password"
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
                            Update Password
                        </GlowingButton>
                    </div>
                </form>
            )}
        </LoginLayout>
    );
};
