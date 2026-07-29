import { useState } from 'react';

/**
 * Renders the demo film section only once /media/demo.mp4 actually exists and
 * its metadata has loaded, so a missing file costs one failed request and no
 * layout. The aspect ratio is reserved by the container, not the video, so
 * there is no shift when it appears.
 */
export const VideoSlot = () => {
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);

    if (failed) return null;

    return (
        <section
            aria-labelledby="video-heading"
            className={ready ? 'border-t border-rule' : 'hidden'}
        >
            <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
                <h2 id="video-heading" className="font-display text-display-m text-ink">
                    Sixty seconds, end to end.
                </h2>
                <div className="mt-8 aspect-video overflow-hidden rounded-surface border border-rule bg-surface-raised">
                    {/* When the file is missing the error fires on the <source>,
                        not the <video>, so both carry the handler. */}
                    <video
                        controls
                        playsInline
                        preload="metadata"
                        className="h-full w-full"
                        onLoadedMetadata={() => setReady(true)}
                        onError={() => setFailed(true)}
                    >
                        <source
                            src="/media/demo.mp4"
                            type="video/mp4"
                            onError={() => setFailed(true)}
                        />
                    </video>
                </div>
            </div>
        </section>
    );
};
