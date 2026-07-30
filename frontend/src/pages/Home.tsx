import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MarketingNav } from '../components/home/MarketingNav';
import { ScannerDemo } from '../components/home/ScannerDemo';
import { Marquee } from '../components/home/Marquee';
import { Lifecycle } from '../components/home/Lifecycle';
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

const STORED = [
    'The receipt photograph',
    'Purchase date and price',
    'Product, brand and serial',
    'Who to contact for a claim',
];
const NOT_STORED = [
    'Card or bank details',
    'Government identifiers',
    'Your location',
    'Anything sold to advertisers',
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

        {/* Hero. An inset deep-pine panel, the same colour in both themes,
            because it is a brand surface rather than a UI one. The white paper
            receipt in the demo is what makes it land: paper against forest. */}
        <section className="px-3 pb-6 pt-2 sm:px-5">
            <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[1.8rem] bg-[#0C2B21] px-5 py-14 sm:rounded-[2.4rem] sm:px-10 sm:py-20 lg:px-16">
                {/* Depth: one warm glow behind the demo, nothing animated. */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(52rem 34rem at 78% 18%, rgba(41,110,86,0.55), transparent 65%), radial-gradient(30rem 22rem at 8% 95%, rgba(28,84,64,0.4), transparent 70%)',
                    }}
                />

                <div className="relative grid items-center gap-14 lg:grid-cols-[1.04fr_0.96fr] lg:gap-6">
                    <div>
                        <h1 className="max-w-[12ch] font-display text-[3rem] font-semibold leading-[0.98] tracking-[-0.04em] text-[#F2EFE6] sm:text-[4.2rem] lg:text-[5.4rem]">
                            The receipt fades. The warranty{' '}
                            <span className="text-[#43C98F]">expires.</span>
                        </h1>
                        <p className="mt-7 max-w-[42ch] text-[1.05rem] leading-8 text-[#F2EFE6]/75">
                            You find out too late. WarrantyPro photographs the receipt once,
                            watches the clock, and drafts the claim.
                        </p>
                        <div className="mt-9 flex flex-wrap items-center gap-3">
                            <Link
                                to="/signup"
                                className="btn bg-[#43C98F] px-6 py-3 text-[0.95rem] text-[#0C2B21] hover:bg-[#5BDCA4]"
                            >
                                Create account
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                            <a
                                href="#how-it-works"
                                className="btn border border-[#3A6B58] px-6 py-3 text-[0.95rem] text-[#F2EFE6] hover:bg-white/5"
                            >
                                How it works
                            </a>
                        </div>
                    </div>

                    <ScannerDemo />
                </div>
            </div>
        </section>

        <Marquee />

        <Lifecycle />

        <ClaimLetter />

        <VideoSlot />

        {/* Specific beats certified. This section says what is held; the claim
            chip it replaced said "bank-level" and could not be checked. */}
        <section aria-labelledby="honesty-heading" className="border-t border-rule">
            <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
                <Reveal>
                    <h2 id="honesty-heading" className="max-w-[22ch] font-display text-display-m text-ink">
                        What we keep, and what we never see.
                    </h2>
                    <div className="mt-8 grid gap-10 sm:grid-cols-2 sm:gap-16">
                        <ul className="grid gap-2.5">
                            {STORED.map((item) => (
                                <li key={item} className="border-b border-rule pb-2.5 text-body text-ink-muted">
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <ul className="grid gap-2.5">
                            {NOT_STORED.map((item) => (
                                <li key={item} className="border-b border-rule pb-2.5 text-body text-neutral">
                                    <s className="decoration-neutral-soft decoration-[1.5px]">{item}</s>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <p className="mt-8 text-body text-ink-muted">
                        The rest is answered in plain terms on{' '}
                        <Link to="/security" className="font-semibold text-accent underline-offset-4 hover:underline">
                            the security page
                        </Link>
                        , including exactly what the AI is shown.
                    </p>
                </Reveal>
            </div>
        </section>

        {/* The close. One sentence, one button, and the line this site is
            actually about. */}
        <section aria-labelledby="cta-heading" className="bg-accent">
            <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
                <Reveal>
                    <h2
                        id="cta-heading"
                        className="max-w-[14ch] font-display text-[2.8rem] font-semibold leading-[1.02] tracking-[-0.035em] text-on-accent sm:text-[4rem] lg:text-[4.6rem]"
                    >
                        Add the receipt in your drawer.
                    </h2>
                    <p className="mt-4 max-w-[40ch] text-body text-on-accent/80">
                        A photograph and about a minute. Free while WarrantyPro is small.
                    </p>
                    <Link
                        to="/signup"
                        className="btn mt-8 bg-on-accent text-accent hover:opacity-90"
                    >
                        Create account
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <p className="mt-12 text-label text-on-accent/70">
                        No invented numbers on this page. Ever.
                    </p>
                </Reveal>
            </div>
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
