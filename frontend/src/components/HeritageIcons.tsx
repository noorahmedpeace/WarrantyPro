import type { ComponentPropsWithoutRef } from 'react';

type SvgProps = ComponentPropsWithoutRef<'svg'>;

export const FamilyCrest = ({ className = '' }: { className?: string }) => {
    return (
        <div
            className={`relative overflow-hidden rounded-[1.75rem] border border-[#d6b980] bg-[linear-gradient(145deg,#fff8df_0%,#ead4a0_38%,#c79b45_100%)] p-3 shadow-[0_14px_30px_rgba(36,22,5,0.35)] ${className}`}
        >
            <div className="rounded-[1.25rem] border border-[#9b7335]/70 bg-[radial-gradient(circle_at_top,#fffdf7_0%,#f2e3ba_55%,#d5b06a_100%)] px-4 py-3 text-[#5d4115] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-10px_24px_rgba(111,72,9,0.18)]">
                <div className="flex items-center gap-3">
                    <LionGlyph className="h-9 w-9 flex-none" />
                    <svg
                        viewBox="0 0 88 88"
                        className="h-16 w-16 flex-none drop-shadow-[0_5px_12px_rgba(96,63,17,0.25)]"
                        aria-hidden="true"
                    >
                        <defs>
                            <linearGradient id="crest-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fffdf8" />
                                <stop offset="100%" stopColor="#ead7ae" />
                            </linearGradient>
                            <linearGradient id="crest-edge" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#c89a3d" />
                                <stop offset="100%" stopColor="#6f4511" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M44 8 67 16v25c0 17.6-11.6 29.9-23 37-11.4-7.1-23-19.4-23-37V16L44 8Z"
                            fill="url(#crest-fill)"
                            stroke="url(#crest-edge)"
                            strokeWidth="3"
                        />
                        <path
                            d="M31 25c4.1 0 6.7 2.1 8.6 6.7l4.4 11.1 4.4-11.1c1.9-4.6 4.5-6.7 8.6-6.7"
                            fill="none"
                            stroke="#8b5d1d"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M27 22c4.2 0 7.9 2.2 10.3 6.6M61 22c-4.2 0-7.9 2.2-10.3 6.6"
                            fill="none"
                            stroke="#b8862f"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                        />
                        <text
                            x="44"
                            y="58"
                            textAnchor="middle"
                            fill="#5d3d11"
                            fontSize="22"
                            fontWeight="700"
                            fontFamily="'Cinzel', serif"
                            letterSpacing="2"
                        >
                            WP
                        </text>
                    </svg>
                    <LionGlyph className="h-9 w-9 flex-none scale-x-[-1]" />
                </div>
                <div
                    className="mt-2 text-center text-[0.58rem] font-semibold uppercase tracking-[0.42em] text-[#5f4418]"
                    style={{ fontFamily: '"Cinzel", serif' }}
                >
                    Heritage Warranty
                </div>
            </div>
        </div>
    );
};

const LionGlyph = ({ className = '' }: { className?: string }) => (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
        <path
            d="M23.8 6.3c3.6.2 6.3 2.8 7.2 6 .6 2-.3 4.6-2.3 5.8 1.7 1.6 2.8 4.4 1.8 7-1.4 3.8-5.7 5.9-9.5 4.6-1.7-.5-3.5-.4-5 .6l-3.8 2.8 1.9-6.3c.5-1.5.3-3.2-.6-4.5-2.6-3.7-1.5-8.8 2.2-11.4 1.5-1.1 3.3-1.6 5-1.4l-2-3 5.1-.2Z"
            fill="none"
            stroke="#6c4716"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx="24.3" cy="15.3" r="1.2" fill="#6c4716" />
        <path
            d="M28 19.8c-2 1.3-4.2 1.7-6.7 1.4M12.8 10.5l3.4 2.6M11.2 16.7l4-.4"
            fill="none"
            stroke="#9c7129"
            strokeWidth="1.9"
            strokeLinecap="round"
        />
    </svg>
);

export const AppleGlyph = (props: SvgProps) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
        <path
            d="M15.4 4.2c.8-1 1.1-2.2 1-3.2-1.2.1-2.5.8-3.3 1.8-.7.8-1.2 2.1-1 3.2 1.3.1 2.5-.6 3.3-1.8Z"
            fill="currentColor"
        />
        <path
            d="M18.7 12.8c0-2.8 2.3-4.2 2.4-4.3-1.3-1.9-3.4-2.2-4.1-2.2-1.7-.2-3.3 1-4.2 1-1 0-2.3-1-3.8-1-2 0-3.8 1.1-4.8 2.9-2.1 3.6-.5 8.9 1.5 11.8 1 1.4 2.1 3 3.7 2.9 1.5-.1 2.1-.9 3.9-.9 1.8 0 2.3.9 3.9.8 1.6 0 2.7-1.5 3.6-2.9 1.2-1.7 1.7-3.3 1.8-3.4-.1 0-3.9-1.5-3.9-4.7Z"
            fill="currentColor"
        />
    </svg>
);

export const HpGlyph = (props: SvgProps) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path
            d="M7.2 8.1v7.8M7.2 12h4.4M11.6 8.1v7.8M14.4 8.1v7.8M14.4 12h2.9c1.5 0 2.3-.8 2.3-1.9 0-1.2-.8-2-2.3-2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
