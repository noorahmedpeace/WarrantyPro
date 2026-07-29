/** @type {import('tailwindcss').Config} */

// Every colour here is a semantic token backed by a CSS custom property defined
// in index.css, so light and dark are one definition rather than two class lists.
// Raw palette utilities (slate-*, sky-*) are being retired: if a value is not in
// this file it does not ship.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
    darkMode: ['class', ':root[data-theme="dark"]'],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                paper: token('paper'),
                surface: token('surface'),
                'surface-raised': token('surface-raised'),
                rule: token('rule'),

                ink: token('ink'),
                'ink-muted': token('ink-muted'),
                neutral: token('neutral'),
                'neutral-soft': token('neutral-soft'),

                // One accent. Status colours below are a separate scale and never
                // borrow it, so "covered" and "primary action" cannot be confused.
                accent: token('accent'),
                'accent-pressed': token('accent-pressed'),
                'accent-wash': token('accent-wash'),
                'on-accent': token('on-accent'),

                covered: token('covered'),
                expiring: token('expiring'),
                expired: token('expired'),
                archived: token('archived'),
                'covered-wash': token('covered-wash'),
                'expiring-wash': token('expiring-wash'),
                'expired-wash': token('expired-wash'),
            },

            fontFamily: {
                sans: ['Geist', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
                // Display and body are the same family at different weights and tracking.
                display: ['Geist', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
                // Data role. System stack, zero bytes, and genuinely good on every target OS.
                mono: ['ui-monospace', 'Cascadia Mono', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
            },

            fontSize: {
                'display-l': ['2.75rem', { lineHeight: '1.02', letterSpacing: '-0.035em', fontWeight: '650' }],
                'display-m': ['1.875rem', { lineHeight: '1.10', letterSpacing: '-0.025em', fontWeight: '650' }],
                heading: ['1.1875rem', { lineHeight: '1.30', letterSpacing: '-0.012em', fontWeight: '600' }],
                body: ['0.9375rem', { lineHeight: '1.60' }],
                label: ['0.8125rem', { lineHeight: '1.40' }],
                caption: ['0.6875rem', { lineHeight: '1.35', letterSpacing: '0.14em' }],
                'data-l': ['1.75rem', { lineHeight: '1.00', letterSpacing: '-0.02em' }],
                'data-s': ['0.8125rem', { lineHeight: '1.40' }],
            },

            // Three radii. Anything else was a bug in the old build.
            borderRadius: {
                control: '6px',
                surface: '10px',
            },

            boxShadow: {
                // Tinted toward the ground hue, never pure black.
                raised: '0 1px 2px rgb(20 24 26 / 0.06)',
                overlay: '0 16px 48px rgb(20 24 26 / 0.18)',
            },

            transitionTimingFunction: {
                enter: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            },

            transitionDuration: {
                feedback: '120ms',
                settle: '180ms',
                enter: '220ms',
                measure: '600ms',
            },
        },
    },
    plugins: [],
}
