'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton({ children, className, ...props }: any) {
    const { pending } = useFormStatus()

    return (
        <button type="submit" disabled={pending} className={className} {...props}>
            {pending ? 'Loading...' : children}
        </button>
    )
}
