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
        <section ref={sectionRef} className="relative mt-8">
            <div
                className={`relative transition-all duration-[900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                    revealed ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-6 scale-[0.97] opacity-0'
                }`}
            >
                <div className="pointer-events-none absolute inset-x-8 inset-y-10 rounded-[1rem] bg-[radial-gradient(circle_at_center,rgba(72,114,186,0.08),rgba(72,114,186,0)_56%),radial-gradient(circle_at_right,rgba(208,171,93,0.05),rgba(208,171,93,0)_32%)] blur-[46px]" />

                <div
                    className="relative aspect-[16/7.5] overflow-hidden rounded-[14px]"
                    style={{
                        maskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.72) 8%, rgba(0,0,0,1) 16%, rgba(0,0,0,1) 84%, rgba(0,0,0,0.72) 92%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.72) 8%, rgba(0,0,0,1) 16%, rgba(0,0,0,1) 84%, rgba(0,0,0,0.72) 92%, transparent 100%)',
                    }}
                >
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,#05070b_0%,#0a1019_45%,#060b12_100%)]" />

                    {shouldLoad && (
                        <video
                            ref={videoRef}
                            src={showcaseVideo}
                            className="absolute inset-0 h-full w-full object-contain brightness-[0.9] contrast-[1.1]"
                            muted
                            playsInline
                            preload="metadata"
                            aria-label="Warranty vault cinematic motion sequence"
                            style={{
                                transform: `translate3d(0, ${parallaxOffset}px, 0) scale(1.01)`,
                                transition: 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
                            }}
                        />
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,20,0.04)_0%,rgba(8,12,20,0.08)_36%,rgba(8,17,30,0.38)_74%,rgba(8,17,30,0.7)_100%)]" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_54%,rgba(3,6,11,0.34)_100%)]" />
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-[linear-gradient(90deg,rgba(5,7,11,0.7),rgba(5,7,11,0))]" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-[linear-gradient(270deg,rgba(5,7,11,0.7),rgba(5,7,11,0))]" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(5,7,11,0),rgba(5,7,11,0.78))]" />
                </div>
            </div>
        </section>
    );
};
