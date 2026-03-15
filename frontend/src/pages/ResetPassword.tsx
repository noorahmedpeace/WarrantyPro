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
                    <div className="p-6 border-4 border-dark bg-red-200 flex flex-col items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <AlertCircle className="w-12 h-12 text-dark" strokeWidth={2.5} />
                        <p className="text-dark font-black text-xl text-center">We couldn't verify your request.</p>
                        <p className="text-dark font-bold text-center">Please request a new link.</p>
                    </div>
                    <Link to="/forgot-password" className="inline-block border-4 border-dark px-8 py-4 font-black uppercase text-dark bg-secondary hover:bg-primary hover:text-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
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
                    <div className="w-20 h-20 bg-green-400 border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                        <CheckCircle2 className="w-10 h-10 text-dark" strokeWidth={3} />
                    </div>
                    <h3 className="flex items-center justify-center gap-3 text-3xl font-black uppercase text-dark">
                        Password Reset!
                    </h3>
                    <p className="border-4 border-dark bg-white p-4 font-bold text-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        Your password has been successfully updated. Redirecting you to login...
                    </p>
                    <Link to="/login" className="inline-flex items-center gap-2 border-4 border-dark px-8 py-4 font-black uppercase text-dark bg-primary text-white hover:bg-secondary hover:text-dark hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                        Login Now <ArrowRight className="w-5 h-5" strokeWidth={3} />
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {status === 'error' && (
                        <div className="p-4 border-4 border-dark bg-red-200 flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <AlertCircle className="w-6 h-6 text-dark flex-shrink-0" />
                            <p className="text-dark font-bold">{message}</p>
                        </div>
                    )}

                    <div className="space-y-2 group">
                        <label className="text-sm font-black text-dark uppercase tracking-wider ml-1">
                            New Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-dark" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="neu-input w-full !pl-12 bg-white"
                                placeholder="••••••••"
                                disabled={status === 'loading'}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <label className="text-sm font-black text-dark uppercase tracking-wider ml-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-dark" />
                            </div>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="neu-input w-full !pl-12 bg-white"
                                placeholder="••••••••"
                                disabled={status === 'loading'}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <GlowingButton
                            type="submit"
                            className="w-full text-lg py-4 bg-primary text-white uppercase tracking-wider"
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
