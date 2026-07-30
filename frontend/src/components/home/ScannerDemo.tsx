import { useEffect, useRef, useState } from 'react';
import { BellRing } from 'lucide-react';
import { CoverageMeter } from '../ui/CoverageMeter';
import { useInView, usePrefersReducedMotion } from '../../lib/reveal';

/**
 * The hero demo: a paper receipt is swept once by a scan beam, the three fields
 * that matter lift off it, and a real warranty record assembles on the right,
 * using the same CoverageMeter component that ships in the product.
 *
 * Design decisions worth keeping:
 * - The receipt keeps fixed paper colours in both themes. It is a photograph of
 *   a physical object; only the record card is software, so only the card
 *   follows the theme. That contrast is the story.
 * - The sequence runs exactly once. An earlier draft re-swept the beam every
 *   nine seconds; a repeat adds no information, so it was cut.
 * - Timers live in a ref and are cleared only on unmount, so scrolling away
 *   mid-sequence cannot freeze it half-played.
 * - Under prefers-reduced-motion the settled end state renders immediately,
 *   complete, not a shortened animation.
 */

type Phase = 'idle' | 'scan' | 'extract' | 'settled';

const RECEIPT_TEAR =
    'polygon(0 0, 100% 0, 100% calc(100% - 7px), 94% 100%, 88% calc(100% - 6px), 81% 100%, 74% calc(100% - 7px), 67% 100%, 60% calc(100% - 5px), 53% 100%, 46% calc(100% - 7px), 39% 100%, 32% calc(100% - 5px), 25% 100%, 18% calc(100% - 7px), 11% 100%, 5% calc(100% - 5px), 0 100%)';

// Fields that fly from the receipt to the record. Deltas are stage-space pixels.
const CHIPS = [
    { label: 'Sony WH-1000XM5', x: 22, y: 132, dx: 148, dy: 92, delay: 0 },
    { label: '30-01-2026', x: 22, y: 96, dx: 176, dy: 176, delay: 110 },
    { label: 'Rs 89,500', x: 118, y: 168, dx: 96, dy: 128, delay: 220 },
];

// Tailwind cannot see a delay computed at runtime, so the stagger is an inline
// style rather than an arbitrary class. Hoisted so it is not re-created per render.
const Highlight = ({
    active,
    delay,
    children,
}: {
    active: boolean;
    delay: number;
    children: React.ReactNode;
}) => (
    <span
        className={`rounded-[2px] px-0.5 transition-colors duration-enter ${
            active ? 'bg-[#DEEDE4]' : 'bg-transparent'
        }`}
        style={{ transitionDelay: `${delay}ms` }}
    >
        {children}
    </span>
);

export const ScannerDemo = () => {
    const reduced = usePrefersReducedMotion();
    const { ref, inView } = useInView<HTMLDivElement>('-40px');
    // A reduced-motion visitor gets the complete end state from the first
    // render; the sequence never runs for them at all.
    const [phase, setPhase] = useState<Phase>(() =>
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'settled' : 'idle'
    );
    const started = useRef(false);
    const timers = useRef<number[]>([]);

    useEffect(() => {
        if (reduced || !inView || started.current) return;
        started.current = true;
        timers.current = [
            window.setTimeout(() => setPhase('scan'), 350),
            window.setTimeout(() => setPhase('extract'), 1800),
            window.setTimeout(() => setPhase('settled'), 3000),
        ];
    }, [inView, reduced]);

    useEffect(() => () => timers.current.forEach(clearTimeout), []);

    const past = (p: Phase) =>
        ['idle', 'scan', 'extract', 'settled'].indexOf(phase) >= ['idle', 'scan', 'extract', 'settled'].indexOf(p);

    return (
        <div
            ref={ref}
            role="img"
            aria-label="A shop receipt is scanned and becomes a warranty record showing six of twelve months of cover remaining"
            className="relative h-[360px] w-full sm:h-[440px]"
        >
            <div
                aria-hidden="true"
                className="absolute left-1/2 top-0 h-[430px] w-[440px] origin-top -translate-x-1/2 scale-[0.78] sm:scale-100"
            >
                {/* The receipt. Paper stays paper in dark mode. */}
                <div
                    className={`absolute left-1 top-2 w-[236px] rotate-[-4deg] bg-[#FCFBF7] px-4 pb-5 pt-4 font-mono text-[11px] leading-[1.7] text-[#33322D] shadow-raised ${
                        phase === 'scan' ? 'scan-running' : ''
                    }`}
                    style={{ clipPath: RECEIPT_TEAR }}
                >
                    <p className="font-semibold tracking-wide">TECH LAND ELECTRONICS</p>
                    <p className="text-[#8A877D]">Dolmen Mall, Clifton</p>
                    <p className="text-[#8A877D]">Karachi</p>
                    <p className="my-1.5 border-t border-dashed border-[#D9D6CB]" />
                    <p>
                        <Highlight active={past('scan')} delay={0}>30-01-2026</Highlight>
                        <span className="text-[#8A877D]"> 14:22</span>
                    </p>
                    <p>
                        <Highlight active={past('scan')} delay={120}>SONY WH-1000XM5</Highlight>
                    </p>
                    <p>
                        <span className="text-[#8A877D]">x1 </span>
                        <Highlight active={past('scan')} delay={240}>Rs 89,500</Highlight>
                    </p>
                    <p className="my-1.5 border-t border-dashed border-[#D9D6CB]" />
                    <p className="font-semibold">TOTAL Rs 89,500</p>
                    <p>
                        <Highlight active={past('scan')} delay={360}>WARRANTY 12 MONTHS</Highlight>
                    </p>
                    <div
                        className="mt-2.5 h-7 rounded-[1px]"
                        style={{
                            background:
                                'repeating-linear-gradient(90deg, #33322D 0 2px, transparent 2px 5px, #33322D 5px 6px, transparent 6px 10px, #33322D 10px 13px, transparent 13px 16px)',
                        }}
                    />
                    <p className="mt-1.5 text-center text-[9px] tracking-[0.2em] text-[#8A877D]">THANK YOU</p>

                    <div className="scan-beam" />
                </div>

                {/* Dotted path from paper to software. */}
                <svg
                    className={`absolute inset-0 h-full w-full transition-opacity duration-measure ${
                        past('extract') ? 'opacity-100' : 'opacity-0'
                    }`}
                    viewBox="0 0 440 430"
                    fill="none"
                >
                    <path
                        d="M 232 150 C 300 150, 320 200, 330 242"
                        stroke="#5E8F7C"
                        strokeWidth="1.5"
                        strokeDasharray="3 6"
                        strokeLinecap="round"
                    />
                </svg>

                {/* The extracted fields in flight. */}
                {CHIPS.map(({ label, x, y, dx, dy, delay }) => (
                    <span
                        key={label}
                        className={`absolute whitespace-nowrap rounded-control border border-[#43C98F] bg-[#DFF3E8] px-2 py-0.5 font-mono text-[10px] text-[#14523F] opacity-0 ${
                            past('extract') ? 'chip-flying' : ''
                        }`}
                        style={
                            {
                                left: x,
                                top: y,
                                '--dx': `${dx}px`,
                                '--dy': `${dy}px`,
                                '--chip-delay': `${delay}ms`,
                            } as React.CSSProperties
                        }
                    >
                        {label}
                    </span>
                ))}

                {/* The record. Fixed white in both themes: on the brand panel it
                    is an object, and objects do not switch theme. */}
                <div
                    className={`absolute bottom-0 right-0 w-[292px] rounded-surface border border-[#E5E2D8] bg-white p-5 shadow-overlay transition-[opacity,transform] duration-enter ease-enter ${
                        past('extract') ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                    }`}
                >
                    <span className="inline-flex items-center rounded-control border border-[#DDE9E4] bg-[#F0F6F2] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1F6F5C]">
                        Record
                    </span>
                    <p className="mt-3 text-label font-semibold text-[#20241F]">Sony WH-1000XM5</p>
                    <p className="mt-0.5 text-label text-[#7C8578]">Sony · Electronics</p>

                    <div className="mt-4">
                        {past('extract') && (
                            <CoverageMeter
                                totalMonths={12}
                                remainingMonths={6}
                                remainingDays={184}
                                showLabel={false}
                            />
                        )}
                    </div>

                    <p className="tabular mt-2 font-mono text-data-s text-[#2E4B41]">
                        6 of 12 months left · until 30 Jan 2027
                    </p>

                    <div
                        className={`mt-4 flex items-center gap-2 border-t border-[#ECE9DF] pt-3 transition-opacity duration-enter ${
                            past('settled') ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <BellRing className="h-3.5 w-3.5 text-[#1F6F5C]" strokeWidth={1.8} />
                        <span className="text-label text-[#4A5248]">Reminder set · 30 Dec 2026</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
