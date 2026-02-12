import React, { createContext, useContext, useState, useEffect } from 'react';

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

    // Dynamic Base URL matching api.ts
    const BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;

    useEffect(() => {
        if (token) {
            // Verify token and load user
            fetch(`${BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.id) {
                        setUser(data);
                    } else {
                        // Invalid token
                        localStorage.removeItem('warranty_token');
                        setToken(null);
                    }
                })
                .catch((err) => {
                    console.error("Auth verification failed:", err);
                    // Only log out on 401/403, but fetch catch usually means network error.
                    // If network error, maybe don't logout? 
                    // But for this MVP, let's keep it simple. 
                    // The main fix is BASE_URL.
                    localStorage.removeItem('warranty_token');
                    setToken(null);
                })
                .finally(() => setLoading(false));
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
