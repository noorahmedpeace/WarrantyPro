const BASE_URL = 'http://localhost:3000';

const getAuthHeaders = () => {
    const token = localStorage.getItem('warranty_token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            ...getAuthHeaders(),
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
    getAll: () => apiRequest<any[]>('/warranties'),
    getOne: (id: string) => apiRequest<any>(`/warranties/${id}`),
    create: (data: any) => apiRequest<any>('/warranties', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    scanImage: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return fetch(`${BASE_URL}/ocr/scan`, {
            method: 'POST',
            body: formData,
        }).then(res => res.json());
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
