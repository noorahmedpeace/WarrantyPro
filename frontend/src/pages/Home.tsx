import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MarketingNav } from '../components/home/MarketingNav';
import { ScannerDemo } from '../components/home/ScannerDemo';
import { Marquee } from '../components/home/Marquee';
import { Bento } from '../components/home/Bento';
import { PortalSwitcher } from '../components/home/PortalSwitcher';
import { ClaimLetter } from '../components/home/ClaimLetter';
import { VideoSlot } from '../components/home/VideoSlot';
import { useReveal } from '../lib/reveal';

/**
 * The public homepage, second pass. The first pass was honest but read as a
 * template; this one tells the product's story in its own props: a paper
 * receipt, the shipped CoverageMeter, and the letter the assistant writes.
 *
 * Deliberately absent, with reasons:
 * - No logo wall. There are no customers to show, and this site's whole
 *   position is that nothing on it is invented.
 * - No particles, no 3D, no aurora. Those are the default reach of generated
 *   sites, which is exactly the look being avoided.
 * - One loop only: the marquee of protectable things, which pauses on hover
 *   and dies under reduced motion. Everything else runs once.
 */

const FAQS: { q: string; a: string }[] = [
    {
        q: 'What does it cost?',
        a: 'Nothing. No card, no trial clock, every feature. When paid tiers arrive they will cover the AI costs, and early accounts keep what they already have.',
    },
    {
        q: 'What do you store?',
        a: 'The receipt photograph, purchase date and price, product, brand, serial, and who to contact for a claim. Never card or bank details, never government identifiers, never your location, and nothing is sold to anyone.',
    },
    {
        q: 'What does the AI see?',
        a: 'The receipt image when you scan it, and the product details plus your fault description when it drafts a claim. It is sent to Google Gemini. It never sees your email address, your other records, or your password.',
    },
    {
        q: 'How is my password stored?',
        a: 'As a bcrypt hash. Nobody at WarrantyPro can read it, and a copy of the database would not reveal it.',
    },
    {
        q: 'Can I delete everything?',
        a: 'Deleting a warranty removes the record, its reminders and any claims filed against it. No soft delete, no archive copy.',
    },
];

const Reveal = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
    const ref = useReveal<HTMLDivElement>();
    return (
        <div ref={ref} className={`reveal ${className}`}>
            {children}
        </div>
    );
};

export const Home = () => (
    <div className="grain-field relative min-h-[100dvh] bg-paper">
        <MarketingNav />

        {/* Hero. Full bleed and a full viewport tall: the first screen is the
            stage, not a card sitting on a page. The nav floats on top of it,
            so nothing interrupts the dark until the marquee. */}
        <section className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden bg-[#0B0B0D] pb-16 pt-28 sm:pt-32">
            {/* Depth: two static radial backlights, nothing animated. */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(60rem 40rem at 76% 8%, rgba(94,106,210,0.34), transparent 62%), radial-gradient(40rem 28rem at 4% 96%, rgba(94,106,210,0.18), transparent 70%)',
                }}
            />

            <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-14">
                <div className="relative grid items-center gap-14 lg:grid-cols-[1fr_1fr] lg:gap-10 xl:gap-14">
                    <div>
                        <h1 className="max-w-[12ch] font-display text-[3rem] font-semibold leading-[0.98] tracking-[-0.04em] text-[#F3F4F6] sm:text-[4.2rem] lg:text-[5.2rem] xl:text-[6.2rem]">
                            The receipt fades. The warranty{' '}
                            <span className="text-[#8B96F0]">expires.</span>
                        </h1>
                        <p className="mt-7 max-w-[42ch] text-[1.05rem] leading-8 text-[#F3F4F6]/70">
                            You find out too late. WarrantyPro photographs the receipt once,
                            watches the clock, and drafts the claim.
                        </p>
                        <div className="mt-9 flex flex-wrap items-center gap-3">
                            <Link
                                to="/signup"
                                className="btn bg-[#5E6AD2] px-6 py-3 text-[0.95rem] text-white shadow-[0_0_28px_rgba(94,106,210,0.45)] hover:bg-[#6E7AE0]"
                            >
                                Create account
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                            <a
                                href="#how-it-works"
                                className="btn border border-white/15 px-6 py-3 text-[0.95rem] text-[#F3F4F6] hover:bg-white/5"
                            >
                                How it works
                            </a>
                        </div>
                    </div>

                    <ScannerDemo />
                </div>
            </div>

            {/* A quiet edge where the stage ends and the page begins. */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-black/40"
            />
        </section>

        <Marquee />

        {/* Metric tiles in the dense dark-panel idiom. Every number on this
            strip is either mechanically true or true about this very page. */}
        <section aria-label="Numbers" className="border-b border-rule">
            <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-rule border-x border-rule lg:grid-cols-4">
                {[
                    { n: '0', label: 'invented numbers on this site' },
                    { n: '30d', label: 'warning before cover ends' },
                    { n: '<60s', label: 'from photograph to record' },
                    { n: '1', label: 'photo is the whole job' },
                ].map(({ n, label }, i) => (
                    <div key={label} className={`px-6 py-8 lg:px-8 lg:py-10 ${i > 1 ? 'border-t border-rule lg:border-t-0' : ''}`}>
                        <p className="tabular font-mono text-[2rem] font-semibold leading-none tracking-[-0.02em] text-ink sm:text-[2.4rem] lg:text-[2.9rem]">
                            {n}
                        </p>
                        <p className="mt-2 text-label text-neutral">{label}</p>
                    </div>
                ))}
            </div>
        </section>

        <Bento />

        <ClaimLetter />

        <PortalSwitcher />

        <VideoSlot />

        {/* The comparison the buyer actually runs: not against competitors,
            against the drawer. Every cell is true, including the last row. */}
        <section aria-labelledby="compare-heading" className="border-t border-rule">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
                <Reveal>
                    <h2 id="compare-heading" className="max-w-[22ch] font-display text-display-m text-ink">
                        The shoebox, the spreadsheet, or this.
                    </h2>
                    <div className="mt-8 overflow-x-auto">
                        <table className="w-full min-w-[640px] border-collapse text-left">
                            <thead>
                                <tr className="border-b border-rule">
                                    <th scope="col" className="py-3 pr-4 text-caption font-semibold uppercase text-neutral"></th>
                                    <th scope="col" className="py-3 pr-4 text-caption font-semibold uppercase text-neutral">The shoebox</th>
                                    <th scope="col" className="py-3 pr-4 text-caption font-semibold uppercase text-neutral">The spreadsheet</th>
                                    <th scope="col" className="py-3 text-caption font-semibold uppercase text-accent">WarrantyPro</th>
                                </tr>
                            </thead>
                            <tbody className="text-label">
                                {[
                                    ['Where the receipt lives', 'Fading in a drawer', 'A photo, somewhere', 'On the record, readable'],
                                    ['Warning before expiry', 'None', 'If you remember to check', '30 days ahead, automatic'],
                                    ['The claim email', 'You compose it, angry', 'You compose it, angry', 'Drafted, dates filled'],
                                    ['Serial when support asks', 'Hunt the box in storage', 'Maybe in a cell', 'On the record'],
                                    ['Price', 'Free', 'Free', 'Also free'],
                                ].map(([label, a, b, c]) => (
                                    <tr key={label} className="border-b border-rule">
                                        <th scope="row" className="py-3.5 pr-4 font-medium text-ink">{label}</th>
                                        <td className="py-3.5 pr-4 text-neutral">{a}</td>
                                        <td className="py-3.5 pr-4 text-neutral">{b}</td>
                                        <td className="py-3.5 font-semibold text-ink">{c}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Reveal>
            </div>
        </section>

        {/* Pricing, told straight. One tier exists and it costs nothing; saying
            so in the shape of a pricing section is the honest version of one. */}
        <section aria-labelledby="pricing-heading" className="border-t border-rule">
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                <Reveal>
                    <div className="glass-card glow-accent p-7 sm:p-8">
                        <p className="text-caption font-semibold uppercase text-neutral">Every account</p>
                        <p className="mt-4 font-display text-[3.4rem] font-semibold leading-none tracking-[-0.03em] text-ink">
                            $0
                        </p>
                        <p className="mt-1 text-label text-neutral">while WarrantyPro is small</p>
                        <ul className="mt-6 grid gap-2.5 text-body text-ink-muted">
                            {['Unlimited records', 'Receipt reading', '30-day expiry warnings', 'Drafted claim letters'].map(
                                (f) => (
                                    <li key={f} className="flex items-center gap-2.5">
                                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
                                        {f}
                                    </li>
                                )
                            )}
                        </ul>
                        <Link to="/signup" className="btn btn-solid mt-7 w-full">
                            Create account
                        </Link>
                        <p className="mt-3 text-center text-label text-neutral">No card. No trial clock.</p>
                    </div>
                </Reveal>
                <Reveal>
                    <h2 id="pricing-heading" className="max-w-[18ch] font-display text-display-m text-ink">
                        Free, and not pretending otherwise.
                    </h2>
                    <p className="mt-4 max-w-[52ch] text-body text-ink-muted">
                        There is no Pro tier and no Enterprise call button, because there is no
                        billing system behind them. When paid tiers arrive, they will pay for the
                        AI costs this product runs on, and early accounts keep what they already
                        have.
                    </p>
                </Reveal>
            </div>
        </section>

        <section aria-labelledby="faq-heading" className="border-t border-rule">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
                <h2 id="faq-heading" className="font-display text-display-m text-ink lg:sticky lg:top-28 lg:self-start">
                    Asked, answered.
                </h2>
                <div className="grid gap-2">
                    {FAQS.map(({ q, a }) => (
                        <details key={q} className="group rounded-surface border border-rule bg-surface open:bg-surface-raised">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-label font-semibold text-ink [&::-webkit-details-marker]:hidden">
                                {q}
                                <span
                                    aria-hidden="true"
                                    className="text-neutral transition-transform duration-feedback group-open:rotate-45"
                                >
                                    +
                                </span>
                            </summary>
                            <p className="px-5 pb-5 text-body text-ink-muted">{a}</p>
                        </details>
                    ))}
                <p className="mt-4 text-label text-neutral">
                    Longer answers live on{' '}
                    <Link to="/security" className="font-semibold text-accent underline-offset-4 hover:underline">
                        the security page
                    </Link>
                    .
                </p>
                </div>
            </div>
        </section>

        {/* The close: a charcoal card with the one backlight, bookending the
            hero, and the line this site is actually about. */}
        <section aria-labelledby="cta-heading" className="relative overflow-hidden bg-[#0B0B0D] px-6 py-28 text-center sm:py-36">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(46rem 30rem at 50% 0%, rgba(94,106,210,0.3), transparent 65%)',
                    }}
                />
                <Reveal className="relative">
                    <h2
                        id="cta-heading"
                        className="mx-auto max-w-[16ch] font-display text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.035em] text-[#F3F4F6] sm:text-[3.8rem] xl:text-[4.6rem]"
                    >
                        Add the receipt in your drawer.
                    </h2>
                    <p className="mx-auto mt-4 max-w-[40ch] text-body text-[#F3F4F6]/70">
                        A photograph and about a minute. Free while WarrantyPro is small.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            to="/signup"
                            className="btn bg-[#5E6AD2] px-6 py-3 text-[0.95rem] text-white shadow-[0_0_28px_rgba(94,106,210,0.45)] hover:bg-[#6E7AE0]"
                        >
                            Create account
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <Link
                            to="/security"
                            className="btn border border-white/15 px-6 py-3 text-[0.95rem] text-[#F3F4F6] hover:bg-white/5"
                        >
                            Read the security page
                        </Link>
                    </div>
                    <p className="mt-12 text-label text-[#F3F4F6]/60">
                        No invented numbers on this page. Ever.
                    </p>
                </Reveal>
        </section>

        <footer className="border-t border-rule">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-label text-neutral sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <span className="font-display font-semibold text-ink">WarrantyPro</span>
                <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
                    <Link to="/security" className="hover:text-ink">Security</Link>
                    <Link to="/login" className="hover:text-ink">Sign in</Link>
                    <Link to="/signup" className="hover:text-ink">Create account</Link>
                </nav>
                <span>© 2026 WarrantyPro</span>
            </div>
        </footer>
    </div>
);
