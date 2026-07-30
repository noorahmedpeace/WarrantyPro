import { useEffect, useRef, useState } from 'react';
import { Camera, FileSearch, BellRing, Send } from 'lucide-react';
import { CoverageMeter } from '../ui/CoverageMeter';

/**
 * Four steps, told as a sticky rail on the left and crafted vignettes on the
 * right. No pinning and no scroll hijack: the rail is position sticky, the
 * active step comes from an IntersectionObserver with a narrow middle band
 * (rootMargin -45%/-45%) so exactly one step can win at a time. The rail also
 * unsticks on short viewports, where sticky plus tall vignettes would fight
 * for the same pixels.
 */

const STEPS = [
    { id: 'photograph', verb: 'Photograph', icon: Camera },
    { id: 'read', verb: 'Read', icon: FileSearch },
    { id: 'watch', verb: 'Watch', icon: BellRing },
    { id: 'claim', verb: 'Claim', icon: Send },
] as const;

/** Tries the generated photo first; falls back to the built vignette. */
const CaptureShot = () => {
    const [hasPhoto, setHasPhoto] = useState(true);

    if (hasPhoto) {
        return (
            <img
                src="/media/capture.jpg"
                onError={() => setHasPhoto(false)}
                alt="A phone photographing a paper receipt on a desk"
                className="aspect-[4/3] w-full max-w-md rounded-surface border border-rule object-cover"
                loading="lazy"
            />
        );
    }

    return (
        <div
            aria-hidden="true"
            className="relative aspect-[4/3] w-full max-w-md rounded-surface border border-rule bg-surface-raised"
        >
            {/* Viewfinder corners */}
            {(['left-4 top-4 border-l-2 border-t-2', 'right-4 top-4 border-r-2 border-t-2', 'bottom-4 left-4 border-b-2 border-l-2', 'bottom-4 right-4 border-b-2 border-r-2'] as const).map(
                (pos) => (
                    <span key={pos} className={`absolute h-6 w-6 rounded-[2px] border-accent ${pos}`} />
                )
            )}
            <div className="absolute left-1/2 top-1/2 w-[150px] -translate-x-1/2 -translate-y-1/2 rotate-[-3deg] bg-[#FCFBF7] px-3 py-3 font-mono text-[9px] leading-[1.7] text-[#33322D] shadow-raised">
                <p className="font-semibold">TECH LAND</p>
                <p className="text-[#8A877D]">30-01-2026</p>
                <p>SONY WH-1000XM5</p>
                <p>Rs 89,500</p>
            </div>
        </div>
    );
};

const ReadVignette = () => (
    <div className="grid max-w-xl gap-4 sm:grid-cols-[1fr_auto_1.15fr] sm:items-center">
        <div className="rotate-[-2deg] justify-self-start bg-[#FCFBF7] px-3.5 py-3 font-mono text-[10px] leading-[1.8] text-[#33322D] shadow-raised">
            <p className="font-semibold">TECH LAND ELECTRONICS</p>
            <p className="text-[#8A877D]">30-01-2026 14:22</p>
            <p>SONY WH-1000XM5</p>
            <p>Rs 89,500</p>
            <p>WARRANTY 12 MONTHS</p>
        </div>

        <span aria-hidden="true" className="hidden font-mono text-neutral-soft sm:block">
            &gt;
        </span>

        <div className="rounded-surface border border-rule bg-surface p-4 font-mono text-data-s">
            {(
                [
                    ['product', 'Sony WH-1000XM5'],
                    ['brand', 'Sony'],
                    ['price', '89,500'],
                    ['purchased', '2026-01-30'],
                    ['warranty', '12 months'],
                    ['serial', 'null'],
                ] as const
            ).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-6 py-0.5">
                    <span className="text-neutral">{key}</span>
                    <span className={value === 'null' ? 'text-neutral-soft' : 'text-ink'}>{value}</span>
                </div>
            ))}
            <p className="mt-2 border-t border-rule pt-2 text-label text-accent">
                Missing, not invented.
            </p>
        </div>
    </div>
);

const WatchVignette = () => (
    <div className="grid max-w-xl gap-3">
        {(
            [
                { name: 'Bosch SMS6 dishwasher', total: 24, left: 1, days: 22, note: '30-day notice sent' },
                { name: 'Sony WH-1000XM5', total: 12, left: 6, days: 184, note: null },
                { name: 'Dell XPS 15', total: 36, left: 0, days: -12, note: null },
            ] as const
        ).map((row) => (
            <div key={row.name} className="rounded-surface border border-rule bg-surface p-4">
                <div className="flex items-baseline justify-between gap-4">
                    <span className="truncate text-label font-semibold text-ink">{row.name}</span>
                    {row.note && (
                        <span className="flex shrink-0 items-center gap-1.5 text-label text-expiring">
                            <BellRing className="h-3.5 w-3.5" strokeWidth={1.8} />
                            {row.note}
                        </span>
                    )}
                </div>
                <div className="mt-2.5">
                    <CoverageMeter totalMonths={row.total} remainingMonths={row.left} remainingDays={row.days} />
                </div>
            </div>
        ))}
        <p className="text-label text-neutral">
            The same CoverageMeter component that ships in the product, running live in all three states.
        </p>
    </div>
);

const ClaimVignette = () => (
    <div className="flex max-w-xl flex-wrap items-center gap-2">
        {(['Describe', 'Diagnose', 'Send'] as const).map((verb, i) => (
            <span key={verb} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true" className="h-px w-6 bg-rule" />}
                <span
                    className={`rounded-control border px-3 py-1.5 text-label font-semibold ${
                        verb === 'Send'
                            ? 'border-accent bg-accent-wash text-accent'
                            : 'border-rule bg-surface text-ink-muted'
                    }`}
                >
                    {verb}
                </span>
            </span>
        ))}
        <p className="mt-2 w-full text-label text-neutral">
            The full letter it writes is below.
        </p>
    </div>
);

const CONTENT: Record<(typeof STEPS)[number]['id'], { title: string; body: string; tile: string; vignette: React.ReactNode }> = {
    photograph: {
        title: 'A photograph is the whole job',
        body: 'Yours, at least. Take one picture of the receipt before it fades and the rest is handled.',
        tile: 'bg-accent-wash',
        vignette: <CaptureShot />,
    },
    read: {
        title: 'The fields come off the paper',
        body: 'Product, price, dates and warranty period are read from the image. Anything the receipt does not say stays empty.',
        tile: 'bg-surface-raised',
        vignette: <ReadVignette />,
    },
    watch: {
        title: 'Every record is a countdown',
        body: 'You get one email 30 days before cover ends, while a repair or return is still possible.',
        tile: 'bg-expiring-wash',
        vignette: <WatchVignette />,
    },
    claim: {
        title: 'When something breaks, it writes the letter',
        body: 'Describe the fault in your words. The claim email arrives drafted, with the paperwork parts already right.',
        tile: 'bg-covered-wash',
        vignette: <ClaimVignette />,
    },
};

export const Lifecycle = () => {
    const [active, setActive] = useState<string>('photograph');
    const blocks = useRef<Map<string, HTMLElement>>(new Map());

    useEffect(() => {
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) setActive(entry.target.id.replace('step-', ''));
                }
            },
            // A narrow horizontal band across the middle of the viewport, so two
            // steps cannot both be "active" and the rail cannot flicker.
            { rootMargin: '-45% 0px -45%' }
        );
        blocks.current.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <section id="how-it-works" aria-labelledby="lifecycle-heading" className="border-t border-rule">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[220px_1fr] lg:gap-16">
                <div className="lg:sticky lg:top-24 lg:self-start [@media(max-height:640px)]:lg:static">
                    <h2 id="lifecycle-heading" className="font-display text-display-m text-ink">
                        From shoebox to system.
                    </h2>
                    <nav aria-label="Steps" className="mt-8 hidden lg:block">
                        {STEPS.map(({ id, verb, icon: Icon }) => (
                            <a
                                key={id}
                                href={`#step-${id}`}
                                aria-current={active === id ? 'step' : undefined}
                                className={`flex items-center gap-3 border-l-2 py-2.5 pl-4 text-label transition-colors duration-feedback ${
                                    active === id
                                        ? 'border-accent font-semibold text-ink'
                                        : 'border-rule text-neutral hover:text-ink'
                                }`}
                            >
                                <Icon className="h-4 w-4" strokeWidth={1.8} />
                                {verb}
                            </a>
                        ))}
                    </nav>
                </div>

                <div>
                    {STEPS.map(({ id }, i) => {
                        const { title, body, tile, vignette } = CONTENT[id];
                        return (
                            <article
                                key={id}
                                id={`step-${id}`}
                                ref={(el) => {
                                    if (el) blocks.current.set(id, el);
                                }}
                                className={`scroll-mt-24 py-10 ${i > 0 ? 'border-t border-rule' : 'lg:pt-2'}`}
                            >
                                <h3 className="font-display text-[1.5rem] font-semibold tracking-[-0.02em] text-ink">{title}</h3>
                                <p className="mt-2 max-w-[52ch] text-body text-ink-muted">{body}</p>
                                <div
                                    className={`mt-6 rounded-surface p-5 transition-transform duration-enter ease-enter hover:-translate-y-1 hover:rotate-[-0.4deg] sm:p-7 ${tile}`}
                                >
                                    {vignette}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
