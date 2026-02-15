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
            title="Welcome Back"
            subtitle="Enter your credentials to access your account"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <div className="space-y-2 group">
                    <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-2 group">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-sm font-medium text-slate-300">Password</label>
                        <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <GlowingButton type="submit" className="w-full py-4 text-lg font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40" isLoading={loading}>
                        <LogIn className="w-5 h-5 mr-2" />
                        Sign In
                    </GlowingButton>
                </div>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-slate-950 text-slate-500">Or continue with</span>
                    </div>
                </div>

                <p className="text-center text-slate-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold hover:opacity-80 transition-opacity">
                        Create free account
                    </Link>
                </p>
            </form>
        </LoginLayout>
    );
};
