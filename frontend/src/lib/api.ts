const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    // Always same-origin: in production Vercel rewrites /api/* to the function,
    // and in dev the Vite proxy (vite.config.ts) forwards /api to localhost:3000.
    // This also keeps mobile access over the LAN working without extra config.
    return '/api';
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
    deleteOne: (id: string) => apiRequest<any>(`/warranties/${id}`, {
        method: 'DELETE',
    }),
    scanImage: async (file: File) => {
        const formData = new FormData();
        formData.append('receipt', file);

        const token = localStorage.getItem('warranty_token');
        const response = await fetch(`${BASE_URL}/ocr/scan-receipt`, {
            method: 'POST',
            // No Content-Type header: the browser must set the multipart boundary itself
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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
    // /claims and /claims/:id answer with an envelope ({ claims } / { claim }), unwrap it here
    getAll: async () => {
        const data = await apiRequest<any>('/claims');
        return Array.isArray(data) ? data : (data?.claims ?? []);
    },
    getOne: async (id: string) => {
        const data = await apiRequest<any>(`/claims/${id}`);
        return data?.claim ?? data;
    },
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
