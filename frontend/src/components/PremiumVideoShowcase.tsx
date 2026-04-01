import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import showcaseVideo from '../assets/warranty-vault-showcase.mp4';

interface PremiumVideoShowcaseProps {
    onViewportChange?: (active: boolean) => void;
}

export const PremiumVideoShowcase = ({ onViewportChange }: PremiumVideoShowcaseProps) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [shouldLoad, setShouldLoad] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [hasEntered, setHasEntered] = useState(false);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShouldLoad(true);
                    setHasEntered(true);
                }

                const active = entry.isIntersecting && entry.intersectionRatio >= 0.45;
                setIsVisible(active);
                onViewportChange?.(active);
            },
            {
                threshold: [0, 0.2, 0.45, 0.7],
                rootMargin: '220px 0px -8% 0px',
            }
        );

        observer.observe(section);

        return () => {
            observer.disconnect();
            onViewportChange?.(false);
        };
    }, [onViewportChange]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !shouldLoad) {
            return;
        }

        if (isVisible) {
            const playPromise = video.play();
            if (playPromise) {
                playPromise.catch(() => undefined);
            }
        } else {
            video.pause();
        }
    }, [isVisible, shouldLoad]);

    const isRevealed = hasEntered || isVisible;

    return (
        <section ref={sectionRef} className="mt-6">
            <div
                className={`relative overflow-hidden rounded-[1.8rem] border border-[#d7bb7e]/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-3 shadow-[0_28px_80px_rgba(1,8,20,0.38)] backdrop-blur-xl transition-all duration-[800ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                    isRevealed ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-5 scale-[0.96] opacity-0'
                }`}
            >
                <div className="pointer-events-none absolute inset-0 rounded-[1.8rem] border border-white/8" />
                <div className="pointer-events-none absolute inset-0 rounded-[1.8rem] bg-[radial-gradient(circle_at_top_left,rgba(107,150,235,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(211,171,96,0.12),transparent_28%)]" />

                <div className="relative overflow-hidden rounded-[1.35rem] border border-white/8 bg-[#0b1220]">
                    <div className="pointer-events-none absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[rgba(8,14,25,0.5)] px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-[#f2dfb2] backdrop-blur-xl">
                        <Sparkles className="h-3.5 w-3.5" strokeWidth={1.9} />
                        Vault Motion
                    </div>

                    <div className="relative aspect-[16/8.8] bg-[radial-gradient(circle_at_center,#1a2433_0%,#0b1220_72%,#060a12_100%)]">
                        {shouldLoad && (
                            <video
                                ref={videoRef}
                                src={showcaseVideo}
                                className="h-full w-full object-contain brightness-[0.88] contrast-[1.08]"
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                aria-label="Warranty vault motion video"
                            />
                        )}

                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(9,13,22,0.02)_0%,rgba(9,13,22,0.18)_44%,rgba(9,18,32,0.72)_100%)]" />
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_52%,rgba(3,6,11,0.38)_100%)]" />
                    </div>

                    <div className="relative flex flex-col gap-3 border-t border-white/8 bg-[linear-gradient(180deg,rgba(7,12,22,0.24),rgba(7,12,22,0.58))] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#a8bed8]">Exploded Device Sequence</p>
                            <p className="mt-1 text-sm text-[#d8e2f0]">The video starts on entry, pauses off-screen, and blends into the premium navy UI.</p>
                        </div>
                        <div className="rounded-full border border-[#d7bb7e]/20 bg-[linear-gradient(180deg,rgba(245,211,119,0.12),rgba(245,211,119,0.04))] px-4 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-[#f2dfb2]">
                            Scroll-Triggered Playback
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
