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
    const textDelayRef = useRef<number | null>(null);
    const revealedRef = useRef(false);
    const hasPlayedRef = useRef(false);
    const [shouldLoad, setShouldLoad] = useState(false);
    const [active, setActive] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [textVisible, setTextVisible] = useState(false);
    const [ended, setEnded] = useState(false);
    const [parallaxOffset, setParallaxOffset] = useState(0);

    useEffect(() => {
        revealedRef.current = revealed;
    }, [revealed]);

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
                const nextRevealed = inViewport || revealedRef.current;

                setActive(inViewport);

                if (inViewport) {
                    setShouldLoad(true);
                    if (!revealedRef.current) {
                        revealedRef.current = true;
                        setRevealed(true);
                    }

                    if (video && !ended) {
                        if (!hasPlayedRef.current) {
                            hasPlayedRef.current = true;
                            video.currentTime = 0;
                        }

                        const playPromise = video.play();
                        if (playPromise) {
                            playPromise.catch(() => undefined);
                        }
                    }
                }

                onViewportChange?.({
                    active: inViewport,
                    revealed: nextRevealed,
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
            onViewportChange?.({ active: false, revealed: revealedRef.current });
        };
    }, [ended, onViewportChange]);

    useEffect(() => {
        if (!revealed || textVisible) {
            return;
        }

        textDelayRef.current = window.setTimeout(() => {
            setTextVisible(true);
            textDelayRef.current = null;
        }, 280);

        return () => {
            if (textDelayRef.current !== null) {
                window.clearTimeout(textDelayRef.current);
                textDelayRef.current = null;
            }
        };
    }, [revealed, textVisible]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !shouldLoad) {
            return;
        }

        const handleEnded = () => {
            setEnded(true);
            if (Number.isFinite(video.duration) && video.duration > 0) {
                video.currentTime = Math.max(video.duration - 0.01, 0);
            }
            video.pause();
        };

        video.addEventListener('ended', handleEnded);

        if (active && !ended && video.paused) {
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
        <section ref={sectionRef} className="relative mt-16 w-full py-8 sm:mt-20 sm:py-12 lg:py-14">
            <div
                className={`transition-all duration-[900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                    revealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
            >
                <div className="relative px-0">
                    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-16">
                        <div
                            className="max-w-2xl text-center lg:text-left"
                            style={{
                                transform: `translate3d(0, ${textVisible ? 0 : 22}px, 0)`,
                                opacity: textVisible ? 1 : 0,
                                transition: 'transform 820ms cubic-bezier(0.22, 1, 0.36, 1) 240ms, opacity 820ms cubic-bezier(0.22, 1, 0.36, 1) 240ms',
                            }}
                        >
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-400">Why WarrantyPro</p>
                            <h3 className="mt-4 text-[2.25rem] font-semibold tracking-[-0.05em] text-[#111111] sm:text-5xl">
                                Save your warranties before they disappear into drawers and folders.
                            </h3>
                            <span className="mx-auto mt-4 block h-[3px] w-16 rounded-full bg-[#38bdf8] lg:mx-0" />
                            <p className="mt-5 max-w-xl text-[0.98rem] leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
                                WarrantyPro keeps receipts, expiry dates, and product records in one elegant flow, so every claim starts with clarity instead of searching.
                            </p>

                            <div className="mt-8 space-y-3">
                                {highlights.map((item, index) => (
                                    <div
                                        key={item}
                                        className="flex items-center justify-center gap-3 text-sm font-medium text-slate-700 sm:text-base lg:justify-start"
                                        style={{
                                            transform: `translate3d(${textVisible ? 0 : 16}px, 0, 0)`,
                                            opacity: textVisible ? 1 : 0,
                                            transition: `transform 720ms cubic-bezier(0.22, 1, 0.36, 1) ${420 + index * 90}ms, opacity 720ms cubic-bezier(0.22, 1, 0.36, 1) ${420 + index * 90}ms`,
                                        }}
                                    >
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#38bdf8]" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div
                            className="relative mx-auto w-full max-w-[36rem] lg:max-w-none"
                            style={{
                                transform: `translate3d(${revealed ? 0 : 18}px, ${revealed ? 0 : 28}px, 0) scale(${revealed ? 1 : 0.965})`,
                                opacity: revealed ? 1 : 0,
                                transition: 'transform 880ms cubic-bezier(0.22, 1, 0.36, 1) 160ms, opacity 880ms cubic-bezier(0.22, 1, 0.36, 1) 160ms',
                            }}
                        >
                            <div className="relative py-1 sm:py-3 lg:py-4">
                                <div
                                    className="relative ml-auto aspect-square w-full max-w-[34rem] overflow-hidden rounded-[1rem] sm:rounded-[1.1rem]"
                                >
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

                                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_60%,rgba(255,255,255,0.18)_84%,rgba(255,255,255,0.42)_100%)]" />
                                    <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-[linear-gradient(90deg,rgba(255,255,255,1),rgba(255,255,255,0.6),rgba(255,255,255,0))]" />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-[linear-gradient(270deg,rgba(255,255,255,1),rgba(255,255,255,0.65),rgba(255,255,255,0))]" />
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.92))]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
