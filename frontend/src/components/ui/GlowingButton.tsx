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
        variantClass = "bg-red-500 hover:bg-red-600 text-white font-semibold shadow-3d hover:shadow-3d-hover active:shadow-3d-active rounded-xl px-6 py-3 transition-all duration-200 justify-center items-center flex active:translate-y-[1px]";
    }

    return (
        <button
            className={twMerge(variantClass, className)}
            disabled={isLoading || props.disabled}
            {...props}
        >
            <span className="relative z-10 flex items-center justify-center w-full gap-2 font-medium tracking-wide">
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {children}
            </span>
        </button>
    );
};
