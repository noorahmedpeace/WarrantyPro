import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteWarrantyModalProps {
    open: boolean;
    itemLabel?: string;
    loading?: boolean;
    error?: string | null;
    onClose: () => void;
    onConfirm: () => void;
}

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
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.14),rgba(15,23,42,0.12)_42%,rgba(15,23,42,0.18)_100%)] px-4 py-8 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                        if (!loading) {
                            onClose();
                        }
                    }}
                >
                    <motion.div
                        className="modal-luxury-shell relative z-10 w-full max-w-lg p-6 sm:p-8"
                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 14, scale: 0.985 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent" />
                        <div className="relative z-10 flex items-start justify-between gap-4">
                            <div>
                                <motion.div
                                    className="inline-flex rounded-2xl border border-red-100 bg-red-50 p-3 text-red-600 shadow-[0_12px_28px_rgba(248,113,113,0.14)]"
                                    animate={{ y: [0, -1.5, 0], opacity: [0.94, 1, 0.94] }}
                                    transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    <AlertTriangle className="h-5 w-5" strokeWidth={2} />
                                </motion.div>
                                <p className="mt-5 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-400">
                                    Delete Warranty
                                </p>
                                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                                    Remove this record from your portfolio?
                                </h3>
                                <p className="mt-4 text-sm leading-7 text-slate-600">
                                    <span className="font-semibold text-slate-900">{safeLabel}</span> will be deleted from
                                    reminders, dashboard views, and claim preparation history. This action cannot be undone.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="rounded-full border border-slate-200 p-2 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" strokeWidth={2} />
                            </button>
                        </div>

                        <div className="relative z-10">
                            <div className="page-shimmer-line mt-6 h-[3px] w-28" />
                        </div>

                        {error && (
                            <div className="relative z-10 mt-6 rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium leading-6 text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="relative z-10 mt-6 rounded-[1.3rem] border border-slate-200 bg-[#fbfdff] px-4 py-4">
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
                                Protected cleanup
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                The workspace will update instantly and remove future reminder surfaces tied to this record.
                            </p>
                        </div>

                        <div className="relative z-10 mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Keep Warranty
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Trash2 className="h-4 w-4" strokeWidth={2} />
                                {loading ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
