import { useId } from 'react';


export const WarrantyProMark = ({ className = '' }: { className?: string }) => {
    const gradientId = useId();
    const orbitId = useId();

    return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
            <defs>
                <linearGradient id={gradientId} x1="14%" y1="12%" x2="86%" y2="88%">
                    <stop offset="0%" stopColor="#0A1128" />
                    <stop offset="58%" stopColor="#233B63" />
                    <stop offset="100%" stopColor="#7DA6C8" />
                </linearGradient>
                <linearGradient id={orbitId} x1="18%" y1="30%" x2="84%" y2="72%">
                    <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#AFC4D8" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.35" />
                </linearGradient>
            </defs>

            <path
                d="M50 10 18 24v26.4c0 22.1 18.2 34.4 32 40.6 13.8-6.2 32-18.5 32-40.6V24L50 10Z"
                fill={`url(#${gradientId})`}
                stroke="#D4D7DD"
                strokeWidth="2.6"
                strokeLinejoin="round"
            />

            <path
                d="M36.5 50.8 45.2 59.5 64.5 40.2"
                fill="none"
                stroke="#F8FAFC"
                strokeWidth="6.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <ellipse
                cx="50"
                cy="51"
                rx="42"
                ry="18"
                fill="none"
                stroke={`url(#${orbitId})`}
                strokeWidth="1.6"
                strokeDasharray="4.5 4.5"
                transform="rotate(-15 50 51)"
            />
        </svg>
    );
};
