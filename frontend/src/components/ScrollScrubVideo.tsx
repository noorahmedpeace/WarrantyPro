import { useEffect, useRef } from 'react';

interface ScrollScrubVideoProps {
    progress: number;
    src: string;
}

export const ScrollScrubVideo = ({ progress, src }: ScrollScrubVideoProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressRef = useRef(progress);
    const durationRef = useRef(0);

    useEffect(() => {
        progressRef.current = progress;
    }, [progress]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) {
            return;
        }

        let animationFrameId = 0;

        const handleLoadedMetadata = () => {
            durationRef.current = video.duration || 0;
        };

        const syncVideo = () => {
            if (durationRef.current > 0) {
                const targetTime = durationRef.current * progressRef.current;
                const nextTime = video.currentTime + (targetTime - video.currentTime) * 0.12;

                if (Number.isFinite(nextTime) && Math.abs(targetTime - video.currentTime) > 0.008) {
                    video.currentTime = nextTime;
                }
            }

            animationFrameId = window.requestAnimationFrame(syncVideo);
        };

        video.pause();
        video.addEventListener('loadedmetadata', handleLoadedMetadata);

        if (video.readyState >= 1) {
            handleLoadedMetadata();
        }

        syncVideo();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, []);

    return (
        <video
            ref={videoRef}
            src={src}
            className="h-full w-full object-contain"
            muted
            playsInline
            preload="auto"
            aria-label="Exploded 3D device animation"
        />
    );
};
