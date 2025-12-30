const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function apiRequest(path: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${path}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(typeof localStorage !== 'undefined' && localStorage.getItem('token')
                ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'API Call Failed' }));
        throw new Error(error.message || 'API Call Failed');
    }

    return response.json();
}

export const warrantiesApi = {
    getAll: (userId: string) => apiRequest(`/warranties?userId=${userId}`),
    getOne: (id: string) => apiRequest(`/warranties/${id}`),
    create: (data: any) => apiRequest('/warranties', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    createBulk: async (payloads: any[]) => {
        // Simple sequential or parallel individual creates if bulk endpoint isn't available
        return Promise.all(payloads.map(payload =>
            apiRequest('/warranties', {
                method: 'POST',
                body: JSON.stringify(payload),
            })
        ));
    },
    update: (id: string, data: any) => apiRequest(`/warranties/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    remove: (id: string) => apiRequest(`/warranties/${id}`, {
        method: 'DELETE',
    }),

    uploadFile: (id: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return fetch(`${BASE_URL}/warranties/${id}/files`, {
            method: 'POST',
            body: formData,
        }).then(res => res.json());
    },
    scanImage: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return fetch('http://localhost:3000/ocr/scan', {
            method: 'POST',
            body: formData,
        }).then(res => res.json());
    }
};

export const categoriesApi = {
    getAll: () => apiRequest('/categories'),
};

export const alertsApi = {
    getAll: (userId: string) => apiRequest(`/alerts?userId=${userId}`),
    markAsRead: (id: string) => apiRequest(`/alerts/${id}/read`, {
        method: 'PATCH',
    }),
    dismiss: (id: string) => apiRequest(`/alerts/${id}/dismiss`, {
        method: 'PATCH',
    }),
    generate: () => apiRequest('/alerts/generate', {
        method: 'POST',
    }),
};

export const settingsApi = {
    get: (userId: string) => apiRequest(`/settings?userId=${userId}`),
    update: (userId: string, data: any) => apiRequest(`/settings/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
};
