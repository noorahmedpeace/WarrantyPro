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

    useEffect(() => {
        if (token) {
            // Verify token and load user
            fetch(`${BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(async res => {
                    if (res.ok) {
                        const data = await res.json();
                        setUser(data);
                    } else if (res.status === 401 || res.status === 403) {
                        // Definitely unauthorized/expired - logout
                        console.warn("Session expired or invalid. Logging out.");
                        localStorage.removeItem('warranty_token');
                        setToken(null);
                        setUser(null);
                    } else {
                        // 500 or 503 (Database connecting) - DO NOT LOGOUT
                        console.warn(`Server returned ${res.status}. Persistence maintained.`);
                    }
                })
                .catch((err) => {
                    console.error("Auth verification network error:", err);
                    // Crucial for mobile stability: 
                    // Do NOT logout on network error. Keep the token and try again later.
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
