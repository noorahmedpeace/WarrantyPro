/**
 * A big scrolling strip of the things people actually put under warranty, each
 * with its own little meter in a different state. Half the words are solid ink,
 * half are outlined, so the band reads as typography rather than a list.
 *
 * This is the single loop on the page. It pauses on hover so it can be read,
 * and reduced motion stops it dead via the global gate.
 */

const ITEMS: { name: string; filled: number }[] = [
    { name: 'iPhone 15 Pro', filled: 3 },
    { name: 'Espresso machine', filled: 1 },
    { name: 'Dishwasher', filled: 4 },
    { name: 'Gaming laptop', filled: 2 },
    { name: 'Air conditioner', filled: 3 },
    { name: 'Washing machine', filled: 1 },
    { name: 'Camera body', filled: 4 },
    { name: 'Headphones', filled: 2 },
    { name: 'Refrigerator', filled: 3 },
    { name: 'Electric kettle', filled: 1 },
];

const MiniMeter = ({ filled }: { filled: number }) => (
    <span aria-hidden="true" className="mx-6 inline-flex shrink-0 gap-1 self-center sm:mx-8">
        {Array.from({ length: 4 }, (_, i) => (
            <span
                key={i}
                className={`h-1.5 w-5 rounded-full sm:h-2 sm:w-7 ${i < filled ? 'bg-accent' : 'bg-rule'}`}
            />
        ))}
    </span>
);

const Run = ({ hidden }: { hidden?: boolean }) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
        {ITEMS.map(({ name, filled }, i) => (
            <span key={name} className="flex shrink-0 items-center">
                <span
                    className={`whitespace-nowrap font-display text-[1.9rem] font-semibold tracking-[-0.03em] sm:text-[2.6rem] ${
                        i % 2 === 0
                            ? 'text-ink'
                            : 'text-transparent [-webkit-text-stroke:1.5px_rgb(var(--neutral-soft))]'
                    }`}
                >
                    {name}
                </span>
                <MiniMeter filled={filled} />
            </span>
        ))}
    </div>
);

export const Marquee = () => (
    <section aria-label="Things people protect" className="marquee border-b border-rule py-8 sm:py-10">
        <div className="marquee-track">
            <Run />
            <Run hidden />
        </div>
    </section>
);
