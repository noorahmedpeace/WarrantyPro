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
                    <div className="p-4 border-4 border-dark bg-red-200 flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <AlertCircle className="w-6 h-6 text-dark flex-shrink-0" />
                        <p className="text-dark font-bold">{error}</p>
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
                        />
                    </div>
                </div>

                <div className="space-y-2 group">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-sm font-black text-dark uppercase tracking-wider">
                            Password
                        </label>
                        <Link to="/forgot-password" className="text-xs font-bold text-dark hover:text-primary transition-colors underline decoration-2">
                            Forgot password?
                        </Link>
                    </div>
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
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <GlowingButton
                        type="submit"
                        className="w-full text-lg py-4 bg-primary text-white"
                        isLoading={loading}
                    >
                        <LogIn className="w-6 h-6 mr-2" />
                        SIGN IN
                    </GlowingButton>
                </div>

                <div className="relative my-8 border-t-4 border-dark">
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white px-4 border-4 border-dark shadow-neu text-xs font-black uppercase text-dark">
                        NEW HERE?
                    </div>
                </div>

                <p className="text-center">
                    <Link to="/signup" className="inline-block border-2 border-dark px-4 py-2 font-black uppercase text-dark hover:bg-secondary hover:-translate-y-1 hover:shadow-neu transition-all">
                        Create Free Account →
                    </Link>
                </p>
            </form>
        </LoginLayout>
    );
};
