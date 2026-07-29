import * as Dialog from '@radix-ui/react-dialog';
import { Trash2, X } from 'lucide-react';
import { GlowingButton } from './GlowingButton';

interface DeleteWarrantyModalProps {
    open: boolean;
    itemLabel?: string;
    loading?: boolean;
    error?: string | null;
    onClose: () => void;
    onConfirm: () => void;
}

/**
 * Rebuilt on Radix Dialog. The previous version was hand-rolled: no focus trap,
 * no escape key, no aria wiring, and focus stayed on the page behind it, so a
 * keyboard user could tab straight past a destructive confirmation without ever
 * reaching its buttons. It also floated the warning icon on a 4.8s infinite loop.
 *
 * The copy lost "Protected cleanup" and "remove future reminder surfaces tied to
 * this record", which described nothing a person could picture.
 */
export const DeleteWarrantyModal = ({
    open,
    itemLabel,
    loading = false,
    error = null,
    onClose,
    onConfirm,
}: DeleteWarrantyModalProps) => {
    const safeLabel = itemLabel || 'this warranty';

    return (
        <Dialog.Root open={open} onOpenChange={(next) => !next && !loading && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay fixed inset-0 z-[70] bg-ink/40 backdrop-blur-[2px]" />

                <Dialog.Content
                    className="dialog-content fixed left-1/2 top-1/2 z-[71] w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-surface border border-rule bg-surface p-6 shadow-overlay"
                    onEscapeKeyDown={(e) => loading && e.preventDefault()}
                    onInteractOutside={(e) => loading && e.preventDefault()}
                >
                    <div className="flex items-start justify-between gap-4">
                        <Dialog.Title className="text-heading text-ink">
                            Delete {safeLabel}?
                        </Dialog.Title>

                        <Dialog.Close
                            aria-label="Close"
                            disabled={loading}
                            className="-mr-1 -mt-1 rounded-control p-1.5 text-neutral transition-colors duration-feedback hover:bg-surface-raised hover:text-ink disabled:opacity-50"
                        >
                            <X className="h-4 w-4" />
                        </Dialog.Close>
                    </div>

                    <Dialog.Description className="mt-3 text-body text-ink-muted">
                        The record, its expiry reminders and any claims filed against it are removed.
                        This cannot be undone.
                    </Dialog.Description>

                    {error && (
                        <p
                            role="alert"
                            className="mt-4 rounded-control border border-expired bg-expired-wash px-3 py-2.5 text-label text-expired"
                        >
                            {error}
                        </p>
                    )}

                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <GlowingButton variant="secondary" onClick={onClose} disabled={loading}>
                            Keep it
                        </GlowingButton>
                        <GlowingButton variant="danger" onClick={onConfirm} isLoading={loading}>
                            {!loading && <Trash2 className="h-4 w-4" aria-hidden="true" />}
                            {loading ? 'Deleting' : 'Delete'}
                        </GlowingButton>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
