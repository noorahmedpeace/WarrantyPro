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
                    <div className="w-20 h-20 bg-green-400 border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                        <CheckCircle2 className="w-10 h-10 text-dark" strokeWidth={3} />
                    </div>
                    <h3 className="flex items-center justify-center gap-3 text-3xl font-black uppercase text-dark">
                        Check Your Inbox
                    </h3>
                    <p className="border-4 border-dark bg-white p-4 font-bold text-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {message}
                    </p>
                    <Link to="/login" className="inline-block border-4 border-dark px-8 py-4 font-black uppercase text-dark bg-primary text-white hover:bg-secondary hover:text-dark hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                        Back to Login
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
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-dark" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="neu-input w-full !pl-12 bg-white"
                                placeholder="you@example.com"
                                disabled={status === 'loading'}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <GlowingButton
                            type="submit"
                            className="w-full text-lg py-4 bg-primary text-white"
                            isLoading={status === 'loading'}
                        >
                            SEND RESET LINK
                        </GlowingButton>
                    </div>

                    <div className="text-center pt-6">
                        <Link to="/login" className="inline-flex items-center gap-2 border-2 border-dark px-4 py-2 font-black uppercase text-dark hover:bg-secondary hover:-translate-y-1 hover:shadow-neu transition-all">
                            <ArrowLeft className="w-4 h-4" strokeWidth={3} />
                            Back to Login
                        </Link>
                    </div>
                </form>
            )}
        </LoginLayout>
    );
};
