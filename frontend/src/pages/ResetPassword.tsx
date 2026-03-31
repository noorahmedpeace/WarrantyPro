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
            <div className="text-center space-y-8">
                <div className="p-6 rounded-2xl border border-red-200 bg-red-50 flex flex-col items-center gap-4 shadow-sm">
                    <AlertCircle className="w-12 h-12 text-red-500" strokeWidth={2.5} />
                    <p className="text-red-900 font-bold text-lg text-center">We couldn't verify your request.</p>
                    <p className="text-red-700 font-medium text-center text-sm">Please request a new link.</p>
                </div>
                <Link to="/forgot-password" className="inline-block px-8 py-3.5 font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/30 transition-all">
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
                <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Password Reset!
                    </h3>
                    <p className="bg-slate-50 border border-slate-100 rounded-xl p-4 font-medium text-slate-600 text-sm">
                        Your password has been successfully updated. Redirecting you to login...
                    </p>
                    <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3.5 font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/30 transition-all">
                        Login Now <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {status === 'error' && (
                        <div className="p-4 rounded-xl border border-red-200 bg-red-50 flex items-center gap-3 shadow-sm">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-red-800 font-medium text-sm">{message}</p>
                        </div>
                    )}

                    <div className="space-y-2 group">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            New Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="neu-input w-full !pl-12"
                                placeholder="••••••••"
                                disabled={status === 'loading'}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="neu-input w-full !pl-12"
                                placeholder="••••••••"
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
                            Update Password
                        </GlowingButton>
                    </div>
                </form>
            )}
        </LoginLayout>
    );
};
