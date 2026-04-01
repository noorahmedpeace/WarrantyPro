import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
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
            navigate('/');
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
                {error && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-700 font-medium text-sm">{error}</p>
                    </div>
                )}

                <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-slate-700 ml-1">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="neu-input w-full !pl-12"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-2 group">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-sm font-semibold text-slate-700">
                            Password
                        </label>
                        <Link to="/forgot-password" className="text-xs font-semibold text-sky-600 hover:text-slate-950 transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="neu-input w-full !pl-12"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <GlowingButton
                        type="submit"
                        className="w-full text-base py-3.5"
                        isLoading={loading}
                    >
                        Sign in to Dashboard
                    </GlowingButton>
                </div>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-slate-400">New to WarrantyPro?</span>
                    </div>
                </div>

                <p className="text-center">
                    <Link to="/signup" className="text-sky-600 hover:text-slate-950 font-semibold transition-colors">
                        Create Free Account &rarr;
                    </Link>
                </p>
            </form>
        </LoginLayout>
    );
};
