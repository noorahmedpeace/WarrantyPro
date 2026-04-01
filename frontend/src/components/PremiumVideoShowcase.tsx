import { useEffect, useRef, useState } from 'react';
import showcaseVideo from '../assets/warranty-vault-showcase.mp4';

interface PremiumVideoShowcaseState {
    active: boolean;
    progress: number;
    revealed: boolean;
}

interface PremiumVideoShowcaseProps {
    onViewportChange?: (state: PremiumVideoShowcaseState) => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const PremiumVideoShowcase = ({ onViewportChange }: PremiumVideoShowcaseProps) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [shouldLoad, setShouldLoad] = useState(false);
    const [active, setActive] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [progress, setProgress] = useState(0);
    const progressRef = useRef(0);
    const durationRef = useRef(0);
    const activeRef = useRef(false);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) {
            return;
        }

        const updateFromViewport = () => {
            const rect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const start = viewportHeight * 0.88;
            const end = viewportHeight * 0.18;
            const rawProgress = (start - rect.top) / Math.max(1, rect.height + start - end);
            const progress = clamp(rawProgress, 0, 1);
            const inViewport = rect.top < viewportHeight * 0.94 && rect.bottom > viewportHeight * 0.08;
            const video = videoRef.current;

            progressRef.current = progress;
            activeRef.current = inViewport;
            setProgress(progress);

            if (!inViewport && video) {
                video.pause();
            }

            if (inViewport) {
                setShouldLoad(true);
                setRevealed(true);
            }

            setActive(inViewport);
            onViewportChange?.({
                active: inViewport,
                progress,
                revealed: inViewport || progress > 0.06,
            });
        };

        const requestUpdate = () => {
            if (rafRef.current !== null) {
                return;
            }

            rafRef.current = window.requestAnimationFrame(() => {
                rafRef.current = null;
                updateFromViewport();
            });
        };

        updateFromViewport();
        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate);

        return () => {
            if (rafRef.current !== null) {
                window.cancelAnimationFrame(rafRef.current);
            }
            window.removeEventListener('scroll', requestUpdate);
            window.removeEventListener('resize', requestUpdate);
            onViewportChange?.({ active: false, progress: progressRef.current, revealed });
        };
    }, [onViewportChange, revealed]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !shouldLoad) {
            return;
        }

        let animationFrameId = 0;

        const handleLoadedMetadata = () => {
            durationRef.current = video.duration || 0;
        };

        const syncVideoToScroll = () => {
            if (activeRef.current && durationRef.current > 0) {
                const targetTime = durationRef.current * progressRef.current;
                const nextTime = video.currentTime + (targetTime - video.currentTime) * 0.16;

                if (Number.isFinite(nextTime) && Math.abs(targetTime - video.currentTime) > 0.005) {
                    video.currentTime = nextTime;
                }
            }

            animationFrameId = window.requestAnimationFrame(syncVideoToScroll);
        };

        video.pause();
        video.addEventListener('loadedmetadata', handleLoadedMetadata);

        if (video.readyState >= 1) {
            handleLoadedMetadata();
        }

        syncVideoToScroll();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [shouldLoad]);

    const scale = 0.98 + progress * 0.02;
    const opacity = active ? 0.7 + progress * 0.3 : revealed ? 0.82 : 0;
    const translateY = active ? 24 - progress * 24 : revealed ? 0 : 28;
    const mediaTranslateY = active ? progress * -18 : 0;

    return (
        <section ref={sectionRef} className="relative mt-8">
            <div
                className="relative transition-all duration-[800ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
                style={{
                    opacity,
                    transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
                }}
            >
                <div className="pointer-events-none absolute inset-x-10 inset-y-8 rounded-[1.2rem] bg-[radial-gradient(circle_at_center,rgba(76,122,198,0.08),rgba(76,122,198,0)_58%),radial-gradient(circle_at_right,rgba(209,174,101,0.08),rgba(209,174,101,0)_34%)] blur-2xl" />

                <div
                    className="relative aspect-[16/7.8] overflow-hidden rounded-[1rem]"
                    style={{
                        maskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.78) 9%, rgba(0,0,0,1) 16%, rgba(0,0,0,1) 84%, rgba(0,0,0,0.78) 91%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.78) 9%, rgba(0,0,0,1) 16%, rgba(0,0,0,1) 84%, rgba(0,0,0,0.78) 91%, transparent 100%)',
                    }}
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#172131_0%,#0c1422_66%,#08101b_100%)]" />

                    {shouldLoad && (
                        <video
                            ref={videoRef}
                            src={showcaseVideo}
                            className="absolute inset-0 h-full w-full object-contain brightness-[0.9] contrast-[1.1]"
                            muted
                            playsInline
                            preload="metadata"
                            aria-label="Warranty vault motion sequence"
                            style={{
                                transform: `translate3d(0, ${mediaTranslateY}px, 0) scale(1.01)`,
                                transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
                            }}
                        />
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,20,0.04)_0%,rgba(8,12,20,0.1)_36%,rgba(8,17,30,0.46)_72%,rgba(8,17,30,0.74)_100%)]" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_56%,rgba(3,6,11,0.34)_100%)]" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(7,11,18,0),rgba(7,11,18,0.78))]" />
                </div>
            </div>
        </section>
    );
};
