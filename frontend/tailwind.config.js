/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#FDFBE8', // stark off-white
                primary: {
                    DEFAULT: '#0F172A', // Deep Navy/Slate
                    light: '#1E293B',
                    dark: '#020617',
                },
                secondary: {
                    DEFAULT: '#059669', // Trustworthy Emerald
                    light: '#10B981',
                    dark: '#047857',
                },
                accent: {
                    DEFAULT: '#38BDF8', // Suble Sky Blue
                    light: '#7DD3FC',
                    dark: '#0284C7',
                },
                dark: '#0F172A',
                light: '#F8FAFC',
                surface: '#FFFFFF',
                border: '#E2E8F0',
            },
            fontFamily: {
                sans: ['Space Grotesk', 'sans-serif'], // chunky sans
                display: ['Space Grotesk', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'floating': '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
                'glow': '0 0 20px rgba(5, 150, 105, 0.15)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'auth-pattern': 'linear-gradient(to bottom right, #0F172A, #1E293B, #020617)',
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'gradient': 'gradient 8s ease infinite',
            },
            keyframes: {
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                }
            }
        },
    },
    plugins: [],
}
