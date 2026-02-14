const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    // Fallback logic for local development
    if (window.location.hostname === 'localhost' || window.location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        return `http://${window.location.hostname}:3000`;
    }
    return '/api'; // Standard Vercel prefix for root-mounted backend
};

export const BASE_URL = getBaseUrl();

const getAuthHeaders = () => {
    const token = localStorage.getItem('warranty_token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}, retries = 3, delay = 1000): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...getAuthHeaders(),
                ...options.headers,
            },
        });

        if (response.status === 503 && retries > 0) {
            console.warn(`Server busy (503). Retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return apiRequest(endpoint, options, retries - 1, delay * 2);
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'API Call Failed' }));
            throw new Error(error.message || 'API Call Failed');
        }

        return response.json();
    } catch (error) {
        if (retries > 0 && (error instanceof TypeError)) {
            // TypeError usually means network error/CORS
            console.warn(`Network error. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return apiRequest(endpoint, options, retries - 1, delay * 2);
        }
        throw error;
    }
}

export const warrantiesApi = {
    getAll: () => apiRequest<any[]>('/warranties'),
    getOne: (id: string) => apiRequest<any>(`/warranties/${id}`),
    create: (data: any) => apiRequest<any>('/warranties', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    scanImage: async (file: File) => {
        const formData = new FormData();
        formData.append('receipt', file);

        const response = await fetch(`${BASE_URL}/ocr/scan-receipt`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to scan receipt');
        }

        return result.data;
    }
};

export const claimsApi = {
    create: (warrantyId: string, data: any) => apiRequest<any>(`/warranties/${warrantyId}/claims`, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    getByWarranty: (warrantyId: string) => apiRequest<any[]>(`/warranties/${warrantyId}/claims`),
    getAll: () => apiRequest<any[]>('/claims'),
    getOne: (id: string) => apiRequest<any>(`/claims/${id}`),
    update: (id: string, data: any) => apiRequest<any>(`/claims/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
};

export const categoriesApi = {
    getAll: () => apiRequest<any[]>('/categories'),
};

export const notificationsApi = {
    getAll: () => apiRequest<any>('/notifications'),
    getUnreadCount: () => apiRequest<{ count: number }>('/notifications/unread-count'),
    markAsRead: (id: string) => apiRequest<any>(`/notifications/${id}/read`, {
        method: 'PATCH',
    }),
    test: () => apiRequest<any>('/notifications/test', {
        method: 'POST',
    }),
};
