import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginLayout } from '../components/layouts/LoginLayout';
import { GlowingButton } from '../components/ui/GlowingButton';

export const Signup = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await signup(email, password, name);
            navigate('/coverage');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LoginLayout
            title="CREATE ACCOUNT"
            subtitle="Join the future of warranty management"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-surface border border-rule bg-surface-raised px-4 py-3 text-sm text-ink-muted">
                    <div className="flex items-center gap-2 font-semibold text-ink">
                        <Sparkles className="h-4 w-4 text-accent" />
                        Get started in minutes
                    </div>
                    <p className="mt-1 leading-6">Create your workspace, scan your first receipt, and keep every warranty in one protected flow.</p>
                </div>

                {error && (
                    <div className="flex items-center gap-3 rounded-control border border-expired bg-expired-wash p-4">
                        <AlertCircle className="w-5 h-5 text-expired flex-shrink-0" />
                        <p className="text-expired font-medium text-sm">{error}</p>
                    </div>
                )}

                <div className="space-y-2 group">
                    <label className="ml-1 text-sm font-semibold text-ink-muted">
                        Full Name
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <User className="h-5 w-5 text-neutral group-focus-within:text-accent transition-colors" />
                        </div>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="field-input w-full !pl-12"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

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
                    <label className="ml-1 text-sm font-semibold text-ink-muted">
                        Password
                    </label>
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
                            placeholder="Create a password"
                        />
                    </div>
                    <p className="ml-1 text-xs text-neutral">Use at least 6 characters for a secure start.</p>
                </div>

                <div className="space-y-2 group">
                    <label className="ml-1 text-sm font-semibold text-ink-muted">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <Lock className="h-5 w-5 text-neutral group-focus-within:text-accent transition-colors" />
                        </div>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="field-input w-full !pl-12"
                            placeholder="Confirm your password"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <GlowingButton
                        type="submit"
                        className="w-full py-3.5 text-base"
                        isLoading={loading}
                    >
                        Create Account
                    </GlowingButton>
                </div>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-rule"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-surface px-4 text-neutral">Already have an account?</span>
                    </div>
                </div>

                <p className="text-center">
                    <Link to="/login" className="font-semibold text-accent hover:text-ink transition-colors">
                        Sign In &rarr;
                    </Link>
                </p>

                <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-neutral">
                    No clutter. Just one clean warranty workspace.
                </p>
            </form>
        </LoginLayout>
    );
};
