import { useEffect, useRef, useState } from 'react';

/** True when the user has asked their OS to reduce motion. Live, not a snapshot. */
export const usePrefersReducedMotion = () => {
    const [reduced, setReduced] = useState(
        () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const onChange = () => setReduced(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    return reduced;
};

/**
 * Adds `is-visible` once the element enters the viewport. Pairs with the
 * `.reveal` rules in index.css. IntersectionObserver, never a scroll listener,
 * and it disconnects after firing so a long page holds no live observers.
 */
export const useReveal = <T extends HTMLElement>() => {
    const ref = useRef<T | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('is-visible');
                    io.disconnect();
                }
            },
            { threshold: 0.15 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, []);

    return ref;
};

/** Reports whether the element is currently on screen. Stays live. */
export const useInView = <T extends HTMLElement>(margin = '0px') => {
    const ref = useRef<T | null>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
            rootMargin: margin,
        });

        io.observe(el);
        return () => io.disconnect();
    }, [margin]);

    return { ref, inView };
};
