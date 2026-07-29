/**
 * The payoff exhibit: the claim email the assistant actually writes, shown as a
 * letter rather than a screenshot. On wide screens three margin notes point at
 * the parts that came from the record; on small screens the notes become a
 * legend under the letter.
 *
 * Codex review note that shaped this: the section must say who sends the mail.
 * It closes on "Sent only when you press send."
 */

const Token = ({ children }: { children: React.ReactNode }) => (
    <mark className="rounded-[3px] bg-accent-wash px-1 py-0.5 text-ink">{children}</mark>
);

const NOTES = [
    'The dates are read from your receipt, not typed from memory.',
    'The serial comes from the record.',
    'Your description of the fault, tidied.',
];

export const ClaimLetter = () => (
    <section aria-labelledby="letter-heading" className="border-t border-rule bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 id="letter-heading" className="font-display text-display-m text-ink">
                The letter it writes.
            </h2>
            <p className="mt-3 max-w-[54ch] text-body text-ink-muted">
                Describe the fault in your words. This arrives drafted, and every date in it came
                from the record.
            </p>

            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_minmax(0,40rem)_1fr]">
                {/* Left margin notes, desktop only */}
                <div aria-hidden="true" className="hidden lg:block">
                    <p className="mt-28 rotate-[-1.5deg] text-right font-mono text-[11px] italic leading-relaxed text-accent">
                        {NOTES[0]} →
                    </p>
                    <p className="mt-40 rotate-[-1deg] text-right font-mono text-[11px] italic leading-relaxed text-accent">
                        {NOTES[1]} →
                    </p>
                </div>

                <figure className="rounded-surface border border-rule bg-paper p-6 shadow-raised sm:p-8">
                    <div className="grid gap-1 border-b border-rule pb-4 font-mono text-data-s text-ink-muted">
                        <p>
                            <span className="text-neutral">To: </span>support@sony.com
                        </p>
                        <p>
                            <span className="text-neutral">Cc: </span>you
                        </p>
                        <p className="text-ink">
                            <span className="text-neutral">Subject: </span>
                            Warranty claim, Sony WH-1000XM5, purchased <Token>30 January 2026</Token>
                        </p>
                    </div>

                    <div className="mt-5 grid gap-4 text-body leading-7 text-ink-muted">
                        <p>Dear Sony Support Team,</p>
                        <p>
                            I am writing to claim under warranty for a Sony WH-1000XM5, purchased on{' '}
                            <Token>30 January 2026</Token> from Tech Land Electronics, Karachi, serial{' '}
                            <Token>7F2K-0113-KHI</Token>. The unit is within its 12-month warranty, which
                            runs until <Token>30 January 2027</Token>. The receipt is attached.
                        </p>
                        <p>
                            After six months of normal use, the right driver produces an intermittent
                            crackle at any volume. I have already re-paired the device, reset it, and
                            reinstalled the firmware; the fault remains.
                        </p>
                        <p>I am requesting a repair or replacement under the warranty terms.</p>
                        <p>
                            Regards,
                            <br />
                            Noor Ahmed
                        </p>
                    </div>

                    <figcaption className="mt-6 border-t border-rule pt-4 text-label text-neutral">
                        Sent only when you press send. Editable until then.
                    </figcaption>
                </figure>

                {/* Right margin note, desktop only */}
                <div aria-hidden="true" className="hidden lg:block">
                    <p className="mt-64 rotate-[1deg] font-mono text-[11px] italic leading-relaxed text-accent">
                        ← {NOTES[2]}
                    </p>
                </div>
            </div>

            {/* Legend for small screens */}
            <ul className="mt-6 grid gap-1.5 lg:hidden">
                {NOTES.map((note) => (
                    <li key={note} className="font-mono text-[11px] italic text-accent">
                        {note}
                    </li>
                ))}
            </ul>
        </div>
    </section>
);
