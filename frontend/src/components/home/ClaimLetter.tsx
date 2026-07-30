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
    <mark className="rounded-[3px] bg-[#E2E5FA] px-1 py-0.5 text-[#20222E]">{children}</mark>
);

const NOTES = [
    'The dates are read from your receipt, not typed from memory.',
    'The serial comes from the record.',
    'Your description of the fault, tidied.',
];

export const ClaimLetter = () => (
    <section id="the-letter" aria-labelledby="letter-heading" className="scroll-mt-24 border-t border-rule bg-surface">
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

                <figure className="relative rotate-[-0.6deg] rounded-surface border border-[#E5E1D4] bg-[#FCFAF4] p-6 shadow-overlay transition-transform duration-enter ease-enter hover:rotate-0 sm:p-8">
                    {/* Tape. */}
                    <span aria-hidden="true" className="absolute -top-3 left-8 h-6 w-24 rotate-[-5deg] rounded-[2px] bg-[#E8DBA4]/70 shadow-raised" />
                    <span aria-hidden="true" className="absolute -top-3 right-10 h-6 w-20 rotate-[4deg] rounded-[2px] bg-[#E8DBA4]/60 shadow-raised" />
                    <div className="grid gap-1 border-b border-[#E5E1D4] pb-4 font-mono text-data-s text-[#4A5248]">
                        <p>
                            <span className="text-[#7C8578]">To: </span>support@sony.com
                        </p>
                        <p>
                            <span className="text-[#7C8578]">Cc: </span>you
                        </p>
                        <p className="text-[#20241F]">
                            <span className="text-[#7C8578]">Subject: </span>
                            Warranty claim, Sony WH-1000XM5, purchased <Token>30 January 2026</Token>
                        </p>
                    </div>

                    <div className="mt-5 grid gap-4 text-body leading-7 text-[#3D443B]">
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

                    <figcaption className="mt-6 border-t border-[#E5E1D4] pt-4 text-label text-[#7C8578]">
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
