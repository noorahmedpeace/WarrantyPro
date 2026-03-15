import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

interface GlowingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
}

export const GlowingButton: React.FC<GlowingButtonProps> = ({
    children,
    className,
    variant = 'primary',
    isLoading,
    ...props
}) => {
    // Note: We use the existing logic but map to neu-button classes defined in index.css
    // For specific variants, we can override background directly.

    let variantClass = "neu-button-primary";
    if (variant === 'secondary') variantClass = "neu-button-secondary";
    if (variant === 'danger') {
        variantClass = "bg-red-500 text-black font-bold border-4 border-dark shadow-neu rounded-none px-6 py-3 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-200 justify-center items-center flex";
    }

    return (
        <button
            className={twMerge(variantClass, className)}
            disabled={isLoading || props.disabled}
            {...props}
        >
            <span className="relative z-10 flex items-center justify-center w-full gap-2 uppercase tracking-wide">
                {isLoading && <Loader2 className="w-5 h-5 animate-spin border-black" />}
                {children}
            </span>
        </button>
    );
};
