/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#f8fafc', // slate-50
                card: '#ffffff',
                primary: '#2563eb', // blue-600
                'primary-hover': '#1d4ed8', // blue-700
                secondary: '#334155', // slate-700
                accent: '#10b981', // emerald-500
                dark: '#0f172a', // slate-900
                muted: '#64748b', // slate-500
                border: '#e2e8f0', // slate-200
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'], 
                display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                '3d': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
                '3d-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
                '3d-active': '0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.4s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
