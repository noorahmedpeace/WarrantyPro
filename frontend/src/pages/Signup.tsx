import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';
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
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LoginLayout
            title="Create Account"
            subtitle="Join the future of warranty management"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <div className="space-y-2 group">
                    <label className={`text-sm font-medium transition-colors duration-200 ml-1 ${name ? 'text-blue-400' : 'text-slate-300'}`}>
                        Full Name
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className={`h-5 w-5 transition-colors duration-200 ${name ? 'text-blue-400' : 'text-slate-500 group-focus-within:text-blue-400'}`} />
                        </div>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:border-slate-600/50"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                <div className="space-y-2 group">
                    <label className={`text-sm font-medium transition-colors duration-200 ml-1 ${email ? 'text-blue-400' : 'text-slate-300'}`}>
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className={`h-5 w-5 transition-colors duration-200 ${email ? 'text-blue-400' : 'text-slate-500 group-focus-within:text-blue-400'}`} />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:border-slate-600/50"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-2 group">
                    <label className={`text-sm font-medium transition-colors duration-200 ml-1 ${password ? 'text-purple-400' : 'text-slate-300'}`}>
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className={`h-5 w-5 transition-colors duration-200 ${password ? 'text-purple-400' : 'text-slate-500 group-focus-within:text-purple-400'}`} />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 hover:border-slate-600/50"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="space-y-2 group">
                    <label className={`text-sm font-medium transition-colors duration-200 ml-1 ${confirmPassword ? 'text-purple-400' : 'text-slate-300'}`}>
                        Confirm Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className={`h-5 w-5 transition-colors duration-200 ${confirmPassword ? 'text-purple-400' : 'text-slate-500 group-focus-within:text-purple-400'}`} />
                        </div>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 hover:border-slate-600/50"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <GlowingButton
                        type="submit"
                        className="w-full py-4 text-lg font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        isLoading={loading}
                    >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Create Account
                    </GlowingButton>
                </div>

                <p className="text-center text-slate-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold hover:opacity-80 transition-opacity">
                        Sign In →
                    </Link>
                </p>
            </form>
        </LoginLayout>
    );
};
