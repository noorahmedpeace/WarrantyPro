import { useEffect, useRef, useState } from 'react';
import { BellRing, FileScan, ShieldCheck } from 'lucide-react';
import showcaseVideo from '../assets/warranty-vault-showcase.mp4';

interface PremiumVideoShowcaseState {
    active: boolean;
    revealed: boolean;
}

interface PremiumVideoShowcaseProps {
    onViewportChange?: (state: PremiumVideoShowcaseState) => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const highlights = [
    {
        icon: FileScan,
        title: 'Save Every Warranty',
        detail: 'Scan, store, and organize documents in one clean place.',
    },
    {
        icon: BellRing,
        title: 'Stay Ahead',
        detail: 'Catch expiries before they turn into missed claims.',
    },
    {
        icon: ShieldCheck,
        title: 'Protect With Confidence',
        detail: 'Keep your records ready whenever support is needed.',
    },
];

export const PremiumVideoShowcase = ({ onViewportChange }: PremiumVideoShowcaseProps) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const frameRef = useRef<number | null>(null);
    const textDelayRef = useRef<number | null>(null);
    const [shouldLoad, setShouldLoad] = useState(false);
    const [active, setActive] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [textReady, setTextReady] = useState(false);
    const [parallaxOffset, setParallaxOffset] = useState(0);

    useEffect(() => {
        const section = sectionRef.current;
        const video = videoRef.current;
        if (!section) {
            return;
        }

        const updateVisualState = () => {
            const rect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const centerDelta = (rect.top + rect.height * 0.5 - viewportHeight * 0.5) / viewportHeight;
            setParallaxOffset(clamp(centerDelta * -18, -18, 18));
        };

        const requestVisualUpdate = () => {
            if (frameRef.current !== null) {
                return;
            }

            frameRef.current = window.requestAnimationFrame(() => {
                frameRef.current = null;
                updateVisualState();
            });
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                const inViewport = entry.isIntersecting && entry.intersectionRatio >= 0.18;

                setActive(inViewport);

                if (inViewport) {
                    setShouldLoad(true);
                    setRevealed(true);
                    if (textDelayRef.current === null && !textReady) {
                        textDelayRef.current = window.setTimeout(() => {
                            setTextReady(true);
                            textDelayRef.current = null;
                        }, 240);
                    }
                    if (video) {
                        const playPromise = video.play();
                        if (playPromise) {
                            playPromise.catch(() => undefined);
                        }
                    }
                } else if (video) {
                    video.pause();
                }

                onViewportChange?.({
                    active: inViewport,
                    revealed: inViewport || revealed,
                });
            },
            {
                threshold: [0, 0.18, 0.4, 0.72],
                rootMargin: '80px 0px -10% 0px',
            }
        );

        observer.observe(section);
        updateVisualState();
        window.addEventListener('scroll', requestVisualUpdate, { passive: true });
        window.addEventListener('resize', requestVisualUpdate);

        return () => {
            observer.disconnect();
            if (frameRef.current !== null) {
                window.cancelAnimationFrame(frameRef.current);
            }
            if (textDelayRef.current !== null) {
                window.clearTimeout(textDelayRef.current);
            }
            window.removeEventListener('scroll', requestVisualUpdate);
            window.removeEventListener('resize', requestVisualUpdate);
            onViewportChange?.({ active: false, revealed });
        };
    }, [onViewportChange, revealed, textReady]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !shouldLoad) {
            return;
        }

        if (active) {
            const playPromise = video.play();
            if (playPromise) {
                playPromise.catch(() => undefined);
            }
        } else {
            video.pause();
        }
    }, [active, shouldLoad]);

    return (
        <section ref={sectionRef} className="relative mt-20 w-screen bg-[#f4f5f6] py-16 sm:py-20">
            <div
                className={`transition-all duration-[900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                    revealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
            >
                <div className="pointer-events-none absolute inset-x-0 inset-y-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.72),rgba(255,255,255,0)_52%),radial-gradient(circle_at_82%_42%,rgba(203,213,225,0.36),rgba(203,213,225,0)_34%)]" />

                <div className="relative px-6 sm:px-10 lg:px-16">
                    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
                        <div
                            className="max-w-2xl"
                            style={{
                                transform: `translate3d(0, ${textReady ? 0 : 18}px, 0)`,
                                opacity: textReady ? 1 : 0,
                                transition: 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 900ms cubic-bezier(0.22, 1, 0.36, 1)',
                            }}
                        >
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-400">Why WarrantyPro</p>
                            <h3 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#111111] sm:text-5xl">
                                Save your warranties before they disappear into drawers and folders.
                            </h3>
                            <span className="mt-4 block h-[3px] w-16 rounded-full bg-[#38bdf8]" />
                            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                                WarrantyPro keeps receipts, expiry dates, and purchase records in one elegant flow, so every claim starts with clarity instead of searching.
                            </p>

                            <div className="mt-8 space-y-4">
                                {highlights.map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={item.title}
                                            className="flex items-start gap-4 rounded-[1.25rem] bg-slate-50 px-4 py-4 transition-all duration-[800ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
                                            style={{
                                                transitionDelay: `${140 + index * 120}ms`,
                                                transform: `translate3d(${revealed ? 0 : 14}px, 0, 0)`,
                                                opacity: revealed ? 1 : 0,
                                            }}
                                        >
                                            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white text-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.06)]">
                                                <Icon className="h-5 w-5" strokeWidth={1.9} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-950">{item.title}</div>
                                                <div className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="pointer-events-none absolute inset-x-8 inset-y-14 bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.18),rgba(148,163,184,0)_58%),radial-gradient(circle_at_right,rgba(56,189,248,0.12),rgba(56,189,248,0)_34%)] blur-[48px]" />

                            <div className="relative py-4 sm:py-6">
                                <div
                                    className="relative aspect-[16/9] overflow-hidden rounded-[16px] bg-[linear-gradient(180deg,#f8f8f6_0%,#f1f3f5_52%,#e8ecf0_100%)]"
                                >
                                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.9),rgba(255,255,255,0.32)_44%,rgba(226,232,240,0.46)_100%)]" />

                                    {shouldLoad && (
                                        <video
                                            ref={videoRef}
                                            src={showcaseVideo}
                                            className="absolute inset-0 h-full w-full object-contain brightness-[0.98] contrast-[1.04]"
                                            muted
                                            playsInline
                                            preload="auto"
                                            aria-label="Warranty vault cinematic motion sequence"
                                            style={{
                                                transform: `translate3d(0, ${parallaxOffset}px, 0) scale(1.01)`,
                                                transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                                            }}
                                        />
                                    )}

                                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(226,232,240,0.06)_36%,rgba(203,213,225,0.14)_74%,rgba(148,163,184,0.18)_100%)]" />
                                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_64%,rgba(148,163,184,0.16)_100%)]" />
                                    <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-[linear-gradient(90deg,rgba(244,245,246,0.96),rgba(244,245,246,0))]" />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-[linear-gradient(270deg,rgba(244,245,246,0.96),rgba(244,245,246,0))]" />
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(244,245,246,0),rgba(244,245,246,0.96))]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
