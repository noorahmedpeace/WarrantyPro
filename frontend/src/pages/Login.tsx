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
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-red-700 font-medium text-sm">{error}</p>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="trust-input !pl-12"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-sm font-semibold text-slate-700">
                            Password
                        </label>
                        <Link to="/forgot-password" className="text-sm font-medium text-secondary hover:text-secondary-light transition-colors">
                            Forgot password?
                        </Link>
                    </div>
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
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        className="trust-button trust-button-primary w-full"
                        disabled={loading}
                    >
                        {loading ? 'WAIT...' : (
                            <>
                                <LogIn className="w-5 h-5 mr-2" />
                                SIGN IN
                            </>
                        )}
                    </button>
                </div>

                <div className="relative my-6 border-t border-slate-200">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-xs font-semibold text-slate-400 uppercase">
                        New Here?
                    </div>
                </div>

                <div className="text-center">
                    <Link to="/signup" className="text-slate-600 font-medium hover:text-primary transition-colors">
                        Create your free account <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </form>
        </LoginLayout>
    );
};
