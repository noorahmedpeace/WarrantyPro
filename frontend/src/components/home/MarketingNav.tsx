import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { WarrantyProMark } from '../HeritageIcons';
import { ThemeToggle } from '../ui/ThemeToggle';

/**
 * The marketing header. Transparent over the hero, then grows a border and a
 * blur once the page moves. The scrolled state comes from an IntersectionObserver
 * on a sentinel at the top of the page, never from a scroll listener.
 */
export const MarketingNav = () => {
    const sentinel = useRef<HTMLDivElement | null>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const el = sentinel.current;
        if (!el) return;
        const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // Over the dark stage the bar is always light; once the page begins it
    // returns to the theme's own ink.
    const link = scrolled
        ? 'text-ink-muted hover:bg-surface-raised hover:text-ink'
        : 'text-[#F3F4F6]/75 hover:bg-white/10 hover:text-[#F3F4F6]';

    return (
        <>
            {/* The sentinel sits a screen down, so the bar only solidifies once
                the hero stage has actually been left behind. */}
            <div ref={sentinel} aria-hidden="true" className="absolute top-0 h-[85dvh] w-px" />
            <header
                className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-enter ${
                    scrolled
                        ? 'border-b border-rule bg-paper/85 backdrop-blur-md'
                        : 'border-b border-transparent'
                }`}
            >
                <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-14">
                    <Link to="/" className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-control bg-accent text-on-accent">
                            <WarrantyProMark className="h-5 w-5" />
                        </span>
                        <span
                            className={`font-display text-heading tracking-tight ${
                                scrolled ? 'text-ink' : 'text-[#F3F4F6]'
                            }`}
                        >
                            WarrantyPro
                        </span>
                    </Link>

                    <nav aria-label="Site" className="flex items-center gap-1 sm:gap-2">
                        <a
                            href="#how-it-works"
                            className={`hidden rounded-control px-3 py-2 text-label font-medium transition-colors duration-feedback md:inline ${link}`}
                        >
                            How it works
                        </a>
                        <Link
                            to="/security"
                            className={`hidden rounded-control px-3 py-2 text-label font-medium transition-colors duration-feedback sm:inline ${link}`}
                        >
                            Security
                        </Link>
                        {scrolled && <ThemeToggle />}
                        <Link
                            to="/login"
                            className={`rounded-control px-3 py-2 text-label font-medium transition-colors duration-feedback ${link}`}
                        >
                            Sign in
                        </Link>
                        <Link to="/signup" className="btn btn-solid hidden sm:inline-flex">
                            Create account
                        </Link>
                    </nav>
                </div>
            </header>
        </>
    );
};
