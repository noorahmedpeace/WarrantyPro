import React, { createContext, useContext, useState, useEffect } from 'react';
import { BASE_URL } from '../lib/api';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('warranty_token'));
    const [loading, setLoading] = useState(true);

    const verifyToken = async (authToken: string, retryCount = 3) => {
        try {
            const res = await fetch(`${BASE_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data);
                return true;
            } else if (res.status === 401 || res.status === 403) {
                console.warn("Session expired or invalid. Logging out.");
                logout();
                return false;
            } else if (res.status === 503 && retryCount > 0) {
                console.warn(`Database connecting (503). Retrying verification... (${retryCount} left)`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return verifyToken(authToken, retryCount - 1);
            }
            // For other errors (500 etc), we don't logout - keep current state if it exists
            return true;
        } catch (err) {
            console.error("Auth verification network error:", err);
            if (retryCount > 0) {
                await new Promise(resolve => setTimeout(resolve, 3000));
                return verifyToken(authToken, retryCount - 1);
            }
            return true; // Assume stale session is valid rather than killing the app
        }
    };

    useEffect(() => {
        if (token) {
            verifyToken(token).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (email: string, password: string) => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('warranty_token', data.token);
    };

    const signup = async (email: string, password: string, name: string) => {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Signup failed');
        }

        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('warranty_token', data.token);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('warranty_token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
