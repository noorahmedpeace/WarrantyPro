import { useState } from 'react';
import { BellRing, ArrowDownRight } from 'lucide-react';
import { CoverageMeter } from '../ui/CoverageMeter';

/**
 * The feature matrix as an asymmetric bento: one 2x2 hero cell, two 1x1 cells,
 * one wide cell and one closer. Every cell shows the actual product mechanism,
 * not an illustration of one, and every cell has a fixed minimum height so the
 * grid cannot shift as content arrives.
 *
 * Cells are glass on the dark canvas; the hero cell gets the one radial
 * backlight. Mobile collapses to a single column in source order.
 */

const FIELDS = [
    ['product', 'Sony WH-1000XM5'],
    ['brand', 'Sony'],
    ['price', '89,500'],
    ['purchased', '2026-01-30'],
    ['warranty', '12 months'],
    ['serial', 'null'],
] as const;

const ExtractCell = () => (
    <div className="glass-card glow-accent transition-[transform,border-color] duration-enter ease-enter hover:-translate-y-1 hover:border-white/[0.16] flex min-h-[420px] flex-col p-6 sm:p-8 lg:col-span-2 lg:row-span-2 lg:min-h-[500px]">
        <h3 className="font-display text-[1.35rem] font-semibold tracking-[-0.02em] text-ink">
            The fields come off the paper
        </h3>
        <p className="mt-2 max-w-[46ch] text-body text-ink-muted">
            The vision model reads the photograph: product, price, dates, warranty period.
            Anything the receipt does not say stays empty.
        </p>

        <div className="mt-8 grid flex-1 items-center gap-6 sm:grid-cols-[auto_1fr]">
            <div className="w-[180px] rotate-[-2deg] justify-self-center bg-[#FCFBF7] px-4 py-3.5 font-mono text-[10.5px] leading-[1.8] text-[#33322D] shadow-overlay sm:justify-self-start">
                <p className="font-semibold">TECH LAND ELECTRONICS</p>
                <p className="text-[#8A877D]">30-01-2026 14:22</p>
                <p>SONY WH-1000XM5</p>
                <p>Rs 89,500</p>
                <p>WARRANTY 12 MONTHS</p>
                <div
                    className="mt-2 h-5"
                    style={{
                        background:
                            'repeating-linear-gradient(90deg, #33322D 0 2px, transparent 2px 5px, #33322D 5px 6px, transparent 6px 10px)',
                    }}
                />
            </div>

            <div className="rounded-surface border border-rule bg-paper/60 p-4 font-mono text-data-s">
                {FIELDS.map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-6 border-b border-rule/60 py-1.5 last:border-0">
                        <span className="text-neutral">{key}</span>
                        <span className={value === 'null' ? 'text-neutral-soft' : 'text-ink'}>{value}</span>
                    </div>
                ))}
                <p className="mt-3 text-label font-semibold text-accent">Missing, not invented.</p>
            </div>
        </div>
    </div>
);

const PhotoCell = () => {
    const [hasPhoto, setHasPhoto] = useState(true);
    return (
        <div className="glass-card transition-[transform,border-color] duration-enter ease-enter hover:-translate-y-1 hover:border-white/[0.16] relative min-h-[200px] overflow-hidden lg:min-h-[236px]">
            {hasPhoto ? (
                <img
                    src="/media/capture.jpg"
                    onError={() => setHasPhoto(false)}
                    alt="A phone photographing a paper receipt"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                />
            ) : (
                <div className="absolute inset-0 bg-surface-raised" aria-hidden="true" />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-10">
                <p className="text-label font-semibold text-white">One photograph is the whole job.</p>
                <p className="text-label text-white/70">Yours, at least.</p>
            </div>
        </div>
    );
};

const ReminderCell = () => (
    <div className="glass-card transition-[transform,border-color] duration-enter ease-enter hover:-translate-y-1 hover:border-white/[0.16] flex min-h-[200px] flex-col justify-between p-6 lg:min-h-[236px]">
        <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-control bg-accent-wash text-accent">
                <BellRing className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <h3 className="font-display text-heading text-ink">One email, in time</h3>
        </div>
        <div>
            <p className="tabular font-mono text-[2.2rem] font-semibold leading-none tracking-[-0.02em] text-ink">
                30 <span className="text-[1rem] text-neutral">days early</span>
            </p>
            <p className="mt-2 text-label text-ink-muted">
                Warned while a repair or return is still possible. Never after.
            </p>
        </div>
    </div>
);

const METER_ROWS = [
    { name: 'Bosch SMS6 dishwasher', total: 24, left: 1, days: 22 },
    { name: 'Sony WH-1000XM5', total: 12, left: 6, days: 184 },
    { name: 'Dell XPS 15', total: 36, left: 0, days: -12 },
] as const;

const MetersCell = () => (
    <div className="glass-card transition-[transform,border-color] duration-enter ease-enter hover:-translate-y-1 hover:border-white/[0.16] min-h-[220px] p-6 sm:p-7 lg:col-span-2">
        <h3 className="font-display text-heading text-ink">Every record is a countdown</h3>
        <div className="mt-5 grid gap-4">
            {METER_ROWS.map((row) => (
                <div key={row.name}>
                    <p className="mb-1.5 truncate text-label font-medium text-ink-muted">{row.name}</p>
                    <CoverageMeter totalMonths={row.total} remainingMonths={row.left} remainingDays={row.days} />
                </div>
            ))}
        </div>
        <p className="mt-5 text-label text-neutral">
            The shipped CoverageMeter component, live, in all three states.
        </p>
    </div>
);

const LetterCell = () => (
    <a
        href="#the-letter"
        className="glass-card transition-[transform,border-color] duration-enter ease-enter hover:-translate-y-1 hover:border-white/[0.16] group flex min-h-[220px] flex-col justify-between p-6 hover:bg-white/[0.05]"
    >
        <h3 className="font-display text-heading text-ink">When something breaks, it writes the letter</h3>
        <div>
            <p className="text-label text-ink-muted">
                Dates, serial and warranty terms filled from the record. You press send, not us.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-label font-semibold text-accent">
                Read the letter
                <ArrowDownRight
                    className="h-4 w-4 transition-transform duration-feedback group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                    aria-hidden="true"
                />
            </span>
        </div>
    </a>
);

export const Bento = () => (
    <section id="how-it-works" aria-labelledby="bento-heading" className="border-t border-rule">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <h2 id="bento-heading" className="max-w-[20ch] font-display text-display-m text-ink">
                From shoebox to system.
            </h2>
            <div className="mt-10 grid gap-4 lg:grid-cols-3 lg:gap-5 lg:grid-rows-[auto_auto_auto]">
                <ExtractCell />
                <PhotoCell />
                <ReminderCell />
                <MetersCell />
                <LetterCell />
            </div>
        </div>
    </section>
);
