import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginLayout } from '../components/layouts/LoginLayout';
import { GlowingButton } from '../components/ui/GlowingButton';

export const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/coverage');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LoginLayout
            title="WELCOME BACK"
            subtitle="Enter your credentials to access your vault"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-surface border border-rule bg-surface-raised px-4 py-3 text-sm text-ink-muted">
                    <div className="flex items-center gap-2 font-semibold text-ink">
                        <ShieldCheck className="h-4 w-4 text-accent" />
                        Secure workspace sign-in
                    </div>
                    <p className="mt-1 leading-6">Pick up your claims, reminders, and receipt history exactly where you left them.</p>
                </div>

                {error && (
                    <div className="flex items-center gap-3 rounded-control border border-expired bg-expired-wash p-4">
                        <AlertCircle className="w-5 h-5 text-expired flex-shrink-0" />
                        <p className="text-expired font-medium text-sm">{error}</p>
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
                        />
                    </div>
                </div>

                <div className="space-y-2 group">
                    <div className="ml-1 flex items-center justify-between">
                        <label className="text-sm font-semibold text-ink-muted">
                            Password
                        </label>
                        <Link to="/forgot-password" className="text-xs font-semibold text-accent hover:text-ink transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <Lock className="h-5 w-5 text-neutral group-focus-within:text-accent transition-colors" />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="field-input w-full !pl-12"
                            placeholder="Enter your password"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <GlowingButton
                        type="submit"
                        className="w-full py-3.5 text-base"
                        isLoading={loading}
                    >
                        Sign in to Dashboard
                    </GlowingButton>
                </div>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-rule"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-surface px-4 text-neutral">New to WarrantyPro?</span>
                    </div>
                </div>

                <p className="text-center">
                    <Link to="/signup" className="font-semibold text-accent hover:text-ink transition-colors">
                        Create Free Account &rarr;
                    </Link>
                </p>

                <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-neutral">
                    Protected by WarrantyPro account security
                </p>
            </form>
        </LoginLayout>
    );
};
