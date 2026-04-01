import { useEffect, useRef, useState } from 'react';
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
    'Save every warranty in one place',
    'Track expiry before it becomes urgent',
    'Keep every receipt ready for claims',
];

export const PremiumVideoShowcase = ({ onViewportChange }: PremiumVideoShowcaseProps) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const frameRef = useRef<number | null>(null);
    const hasPlayedRef = useRef(false);
    const [shouldLoad, setShouldLoad] = useState(false);
    const [active, setActive] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [ended, setEnded] = useState(false);
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
            setParallaxOffset(clamp(centerDelta * -16, -16, 16));
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

                    if (video && !ended) {
                        if (!hasPlayedRef.current) {
                            hasPlayedRef.current = true;
                        }

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
                rootMargin: '40px 0px -8% 0px',
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
            window.removeEventListener('scroll', requestVisualUpdate);
            window.removeEventListener('resize', requestVisualUpdate);
            onViewportChange?.({ active: false, revealed });
        };
    }, [ended, onViewportChange, revealed]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !shouldLoad) {
            return;
        }

        const handleEnded = () => {
            setEnded(true);
            video.pause();
        };

        video.addEventListener('ended', handleEnded);

        if (active && !ended) {
            const playPromise = video.play();
            if (playPromise) {
                playPromise.catch(() => undefined);
            }
        }

        return () => {
            video.removeEventListener('ended', handleEnded);
        };
    }, [active, ended, shouldLoad]);

    return (
        <section ref={sectionRef} className="relative mt-20 w-screen bg-[#f4f5f6] py-16 sm:py-20">
            <div
                className={`transition-all duration-[900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                    revealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
            >
                <div className="pointer-events-none absolute inset-x-0 inset-y-0 bg-[radial-gradient(circle_at_65%_45%,rgba(255,255,255,0.7),rgba(255,255,255,0)_36%),radial-gradient(circle_at_82%_42%,rgba(203,213,225,0.34),rgba(203,213,225,0)_28%)]" />

                <div className="relative px-6 sm:px-10 lg:px-16">
                    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-16">
                        <div
                            className="max-w-2xl"
                            style={{
                                transform: `translate3d(0, ${revealed ? 0 : 18}px, 0)`,
                                opacity: revealed ? 1 : 0,
                                transition: 'transform 800ms cubic-bezier(0.22, 1, 0.36, 1) 120ms, opacity 800ms cubic-bezier(0.22, 1, 0.36, 1) 120ms',
                            }}
                        >
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-400">Why WarrantyPro</p>
                            <h3 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#111111] sm:text-5xl">
                                Save your warranties before they disappear into drawers and folders.
                            </h3>
                            <span className="mt-4 block h-[3px] w-16 rounded-full bg-[#38bdf8]" />
                            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                                WarrantyPro keeps receipts, expiry dates, and product records in one elegant flow, so every claim starts with clarity instead of searching.
                            </p>

                            <div className="mt-8 space-y-3">
                                {highlights.map((item, index) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-3 text-sm font-medium text-slate-700 sm:text-base"
                                        style={{
                                            transform: `translate3d(${revealed ? 0 : 14}px, 0, 0)`,
                                            opacity: revealed ? 1 : 0,
                                            transition: `transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${180 + index * 80}ms, opacity 700ms cubic-bezier(0.22, 1, 0.36, 1) ${180 + index * 80}ms`,
                                        }}
                                    >
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#38bdf8]" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="pointer-events-none absolute inset-x-10 inset-y-14 bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.18),rgba(148,163,184,0)_58%),radial-gradient(circle_at_right,rgba(56,189,248,0.1),rgba(56,189,248,0)_30%)] blur-[46px]" />

                            <div className="relative py-4 sm:py-6">
                                <div className="relative aspect-[16/9] overflow-hidden rounded-[16px] bg-[linear-gradient(180deg,#f8f8f6_0%,#f1f3f5_52%,#e8ecf0_100%)]">
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
                                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_68%,rgba(148,163,184,0.14)_100%)]" />
                                    <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-[linear-gradient(90deg,rgba(244,245,246,0.96),rgba(244,245,246,0))]" />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-[linear-gradient(270deg,rgba(244,245,246,0.96),rgba(244,245,246,0))]" />
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
