import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MarketingNav } from '../components/home/MarketingNav';
import { ScannerDemo } from '../components/home/ScannerDemo';
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
 * - Nothing loops. Motion runs once, when it has something to say.
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

        {/* Hero. The demo is the visual; the receipt in it is the product's
            actual subject, not an illustration of one. */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:pt-16">
            <div>
                <h1 className="max-w-[13ch] font-display text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.035em] text-ink sm:text-[3.3rem] lg:text-[3.8rem]">
                    The receipt fades. The warranty expires.
                </h1>
                <p className="mt-6 max-w-[44ch] text-body text-ink-muted sm:text-[1.05rem] sm:leading-8">
                    You find out too late. WarrantyPro photographs the receipt once, watches the
                    clock, and drafts the claim.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link to="/signup" className="btn btn-solid">
                        Create account
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <a href="#how-it-works" className="btn btn-quiet">
                        How it works
                    </a>
                </div>
            </div>

            <ScannerDemo />
        </section>

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
                        className="max-w-[16ch] font-display text-[2.4rem] font-semibold leading-[1.05] tracking-[-0.03em] text-on-accent sm:text-[3rem]"
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
