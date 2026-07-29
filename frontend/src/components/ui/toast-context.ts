import { createContext } from 'react';

export interface ToastApi {
    success: (title: string, detail?: string) => void;
    error: (title: string, detail?: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);
