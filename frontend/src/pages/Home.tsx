import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CoverageMeter } from '../components/ui/CoverageMeter';
import { WarrantyProMark } from '../components/HeritageIcons';
import { ThemeToggle } from '../components/ui/ThemeToggle';

/**
 * The public site. Until now WarrantyPro had none: "/" sat behind
 * ProtectedRoute, so every signed-out arrival was redirected to a login form
 * and the company's entire public face was a password field.
 *
 * The job here is not to look expensive. It is to make a stranger understand
 * what happens to their receipt before they decide whether to hand it over.
 */

const STORED = ['The receipt photograph', 'Purchase date and price', 'Product, brand and serial', 'Who to contact for a claim'];
const NOT_STORED = ['Card or bank details', 'Government identifiers', 'Your location', 'Anything sold to advertisers'];

export const Home = () => (
    <div className="min-h-[100dvh] bg-paper">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
            <span className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-control bg-accent text-on-accent">
                    <WarrantyProMark className="h-5 w-5" />
                </span>
                <span className="font-display text-heading tracking-tight text-ink">WarrantyPro</span>
            </span>

            <nav className="flex items-center gap-2 sm:gap-3">
                <ThemeToggle />
                <Link to="/security" className="hidden text-label font-medium text-ink-muted hover:text-ink sm:inline">
                    Security
                </Link>
                <Link to="/login" className="text-label font-medium text-ink-muted hover:text-ink">
                    Sign in
                </Link>
                <Link to="/signup" className="btn btn-solid">
                    Create account
                </Link>
            </nav>
        </header>

        {/* Asymmetric, not centred. The meter is the product, so it sits at the
            same level as the sentence rather than under it. */}
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pt-16">
            <div>
                <h1 className="max-w-[15ch] font-display text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[3.25rem] lg:text-[3.75rem]">
                    Your receipts expire. You find out too late.
                </h1>
                <p className="mt-5 max-w-[46ch] text-body text-ink-muted">
                    Photograph the receipt once. We read the date and tell you 30 days before the
                    cover runs out.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link to="/signup" className="btn btn-solid">
                        Create account
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link to="/security" className="btn btn-quiet">
                        What we store
                    </Link>
                </div>
            </div>

            {/* A working component, not a picture of one. It is also the fastest
                accessibility check we have: if the meter reads badly here it
                reads badly on every record in the product. */}
            <div className="rounded-surface border border-rule bg-surface p-5 shadow-raised sm:p-6">
                <p className="text-caption font-semibold uppercase text-neutral">Live example</p>
                <div className="mt-5 grid gap-5">
                    {[
                        { name: 'Bosch SMS6 dishwasher', total: 24, left: 8, days: 243, until: '14 Mar 2027' },
                        { name: 'Sony WH-1000XM5', total: 12, left: 2, days: 41, until: '02 Feb 2027' },
                        { name: 'Dell XPS 15', total: 36, left: 0, days: -12, until: '18 Jul 2026' },
                    ].map((item) => (
                        <div key={item.name}>
                            <div className="flex items-baseline justify-between gap-3">
                                <span className="truncate text-label font-semibold text-ink">{item.name}</span>
                                <span className="tabular shrink-0 font-mono text-data-s text-neutral">{item.until}</span>
                            </div>
                            <div className="mt-2">
                                <CoverageMeter
                                    totalMonths={item.total}
                                    remainingMonths={item.left}
                                    remainingDays={item.days}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Different layout family: a full-width band, not another split. */}
        <section className="border-y border-rule bg-surface">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
                <h2 className="max-w-[22ch] font-display text-display-m text-ink">
                    What happens when something breaks
                </h2>
                <div className="mt-8 grid gap-8 sm:grid-cols-3">
                    {[
                        { verb: 'Describe', body: 'Tell it what the product is doing. Plain words are enough.' },
                        { verb: 'Diagnose', body: 'It asks what a support desk would ask, and rules out the obvious first.' },
                        { verb: 'Send', body: 'You get a written claim email with the dates and serial filled in. You read it before it goes.' },
                    ].map(({ verb, body }) => (
                        <div key={verb} className="border-t border-rule pt-4">
                            <h3 className="font-display text-heading text-ink">{verb}</h3>
                            <p className="mt-2 max-w-[34ch] text-body text-ink-muted">{body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Two columns of plain lists. The strongest trust signal available is
            being specific, so this says what is held rather than claiming a grade. */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="grid gap-10 sm:grid-cols-2 sm:gap-16">
                <div>
                    <h2 className="font-display text-heading text-ink">What we store</h2>
                    <ul className="mt-4 grid gap-2.5">
                        {STORED.map((item) => (
                            <li key={item} className="border-b border-rule pb-2.5 text-body text-ink-muted">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2 className="font-display text-heading text-ink">What we never store</h2>
                    <ul className="mt-4 grid gap-2.5">
                        {NOT_STORED.map((item) => (
                            <li key={item} className="border-b border-rule pb-2.5 text-body text-neutral">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mt-14 rounded-surface border border-rule bg-surface p-6 sm:p-8">
                <h2 className="max-w-[24ch] font-display text-display-m text-ink">
                    Add the receipt sitting in your drawer.
                </h2>
                <p className="mt-3 max-w-[52ch] text-body text-ink-muted">
                    It takes a photograph and about a minute. Free while WarrantyPro is small.
                </p>
                <Link to="/signup" className="btn btn-solid mt-6">
                    Create account
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
            </div>
        </section>

        <footer className="border-t border-rule">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-label text-neutral sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <span>WarrantyPro</span>
                <span className="flex gap-5">
                    <Link to="/security" className="hover:text-ink">Security</Link>
                    <Link to="/login" className="hover:text-ink">Sign in</Link>
                </span>
            </div>
        </footer>
    </div>
);
