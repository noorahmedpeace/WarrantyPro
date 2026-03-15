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
                <div className="text-center space-y-6">
                    <div className="p-8 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-500" strokeWidth={2.5} />
                        </div>
                        <p className="text-red-800 font-bold text-lg text-center">We couldn't verify your request.</p>
                        <p className="text-red-600 font-medium text-center text-sm">The link might have expired or been used already.</p>
                    </div>
                    <Link to="/forgot-password" className="trust-button trust-button-primary w-full text-center">
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
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={2.5} />
                    </div>
                    <h3 className="flex items-center justify-center gap-3 text-2xl font-bold text-slate-900">
                        Password Reset!
                    </h3>
                    <p className="bg-emerald-50 text-emerald-800 p-4 rounded-xl font-medium border border-emerald-100">
                        Your password has been successfully updated. Redirecting you to login...
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {status === 'error' && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-700 font-medium text-sm">{message}</p>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            New Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="trust-input !pl-12"
                                placeholder="••••••••"
                                disabled={status === 'loading'}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="trust-input !pl-12"
                                placeholder="••••••••"
                                disabled={status === 'loading'}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="trust-button trust-button-primary w-full"
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? 'UPDATING...' : 'UPDATE PASSWORD'}
                        </button>
                    </div>
                </form>
            )}
        </LoginLayout>
    );
};
