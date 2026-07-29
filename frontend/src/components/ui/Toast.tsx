import { useCallback, useMemo, useState } from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import { CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { ToastContext, type ToastApi } from './toast-context';

type Tone = 'success' | 'error';

interface ToastMessage {
    id: number;
    tone: Tone;
    title: string;
    /** What to do next. An error that does not say this is just an apology. */
    detail?: string;
}


/**
 * Replaces window.alert(), which the claim flow used for both failure and
 * success. alert() blocks the whole page, cannot be styled, cannot be dismissed
 * with anything but a click, and on the success path it stood between the user
 * and the claim they had just filed.
 */
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [messages, setMessages] = useState<ToastMessage[]>([]);

    const push = useCallback((tone: Tone, title: string, detail?: string) => {
        setMessages((current) => [...current, { id: Date.now() + Math.random(), tone, title, detail }]);
    }, []);

    const api = useMemo<ToastApi>(
        () => ({
            success: (title, detail) => push('success', title, detail),
            error: (title, detail) => push('error', title, detail),
        }),
        [push]
    );

    const dismiss = (id: number) => setMessages((current) => current.filter((m) => m.id !== id));

    return (
        <ToastContext.Provider value={api}>
            <RadixToast.Provider swipeDirection="right" duration={6000}>
                {children}

                {messages.map(({ id, tone, title, detail }) => (
                    <RadixToast.Root
                        key={id}
                        onOpenChange={(open) => !open && dismiss(id)}
                        className="toast-root flex items-start gap-3 rounded-surface border border-rule bg-surface p-4 shadow-overlay"
                    >
                        {tone === 'success' ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-covered" aria-hidden="true" />
                        ) : (
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-expired" aria-hidden="true" />
                        )}

                        <div className="min-w-0 flex-1">
                            <RadixToast.Title className="text-label font-semibold text-ink">
                                {title}
                            </RadixToast.Title>
                            {detail && (
                                <RadixToast.Description className="mt-1 text-label text-ink-muted">
                                    {detail}
                                </RadixToast.Description>
                            )}
                        </div>

                        <RadixToast.Close
                            aria-label="Dismiss"
                            className="rounded-control p-1 text-neutral transition-colors duration-feedback hover:bg-surface-raised hover:text-ink"
                        >
                            <X className="h-3.5 w-3.5" />
                        </RadixToast.Close>
                    </RadixToast.Root>
                ))}

                <RadixToast.Viewport className="fixed bottom-24 right-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 outline-none md:bottom-6" />
            </RadixToast.Provider>
        </ToastContext.Provider>
    );
};
