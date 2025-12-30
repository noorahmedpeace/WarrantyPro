const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const authApi = {
    requestMagicLink: async (email: string) => {
        const response = await fetch(`${API_URL}/auth/magic-link`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        return response.ok;
    },

    verifyToken: async (token: string) => {
        const response = await fetch(`${API_URL}/auth/verify?token=${token}`, {
            method: "GET",
        });
        if (!response.ok) throw new Error("Invalid token");
        return response.json();
    },

    register: async (data: any) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Registration failed");
        }
        return response.json();
    },

    login: async (data: any) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Login failed");
        }
        return response.json();
    },
};
