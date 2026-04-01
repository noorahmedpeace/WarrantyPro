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
    let variantClass = "neu-button-primary";
    if (variant === 'secondary') variantClass = "neu-button-secondary";
    if (variant === 'danger') {
        variantClass = "rounded-xl px-6 py-3 transition-all duration-200 justify-center items-center flex font-semibold text-white border border-red-300/20 bg-[linear-gradient(180deg,#f87171_0%,#b91c1c_100%)] shadow-[0_14px_26px_rgba(185,28,28,0.24)]";
    }

    return (
        <button
            className={twMerge(`${variantClass} hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0`, className)}
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
