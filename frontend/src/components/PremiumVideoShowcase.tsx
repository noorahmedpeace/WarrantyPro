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

export const PremiumVideoShowcase = ({ onViewportChange }: PremiumVideoShowcaseProps) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const frameRef = useRef<number | null>(null);
    const [shouldLoad, setShouldLoad] = useState(false);
    const [active, setActive] = useState(false);
    const [revealed, setRevealed] = useState(false);
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
            window.removeEventListener('scroll', requestVisualUpdate);
            window.removeEventListener('resize', requestVisualUpdate);
            onViewportChange?.({ active: false, revealed });
        };
    }, [onViewportChange, revealed]);

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
        <section ref={sectionRef} className="relative mt-16 w-screen">
            <div
                className={`relative transition-all duration-[900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                    revealed ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-6 scale-[0.97] opacity-0'
                }`}
            >
                <div className="pointer-events-none absolute inset-x-0 inset-y-16 bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.12),rgba(148,163,184,0)_58%),radial-gradient(circle_at_right,rgba(56,189,248,0.08),rgba(56,189,248,0)_32%)] blur-[52px]" />

                <div className="relative bg-white py-4 sm:py-6">
                    <div
                        className="relative aspect-[16/7.2] overflow-hidden rounded-[14px]"
                        style={{
                            maskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.72) 7%, rgba(0,0,0,1) 14%, rgba(0,0,0,1) 86%, rgba(0,0,0,0.72) 93%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.72) 7%, rgba(0,0,0,1) 14%, rgba(0,0,0,1) 86%, rgba(0,0,0,0.72) 93%, transparent 100%)',
                        }}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_42%,#f1f5f9_100%)]" />

                        {shouldLoad && (
                            <video
                                ref={videoRef}
                                src={showcaseVideo}
                                className="absolute inset-0 h-full w-full object-contain brightness-[0.96] contrast-[1.06]"
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

                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(226,232,240,0.08)_36%,rgba(203,213,225,0.18)_74%,rgba(148,163,184,0.22)_100%)]" />
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_58%,rgba(148,163,184,0.18)_100%)]" />
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-[linear-gradient(90deg,rgba(255,255,255,0.96),rgba(255,255,255,0))]" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-[linear-gradient(270deg,rgba(255,255,255,0.96),rgba(255,255,255,0))]" />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.92))]" />
                    </div>
                </div>
            </div>
        </section>
    );
};
