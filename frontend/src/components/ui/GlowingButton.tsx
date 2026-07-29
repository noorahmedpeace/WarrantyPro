import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    isLoading?: boolean;
}

const VARIANT: Record<Variant, string> = {
    primary: 'btn-solid',
    secondary: 'btn-quiet',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
};

/**
 * The export name is kept because a dozen files import it, but nothing about it
 * glows any more. It used to lift half a rem and cast a coloured shadow on
 * hover, which is exactly what cards and links also did, so hover meant nothing
 * in particular. Feedback is now a 1px push on press, which is the one moment
 * the user actually did something.
 */
export const GlowingButton: React.FC<ButtonProps> = ({
    children,
    className,
    variant = 'primary',
    isLoading,
    disabled,
    ...props
}) => (
    <button
        className={twMerge('btn', VARIANT[variant], className)}
        disabled={isLoading || disabled}
        aria-busy={isLoading || undefined}
        {...props}
    >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
    </button>
);
