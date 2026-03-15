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
                card: '#FFFFFF',
                primary: '#FF4500', // vivid orange/red
                secondary: '#FFD700', // vivid yellow
                accent: '#00FA9A', // bright green
                dark: '#1A1A1A',
            },
            fontFamily: {
                sans: ['Space Grotesk', 'sans-serif'], // chunky sans
                display: ['Space Grotesk', 'sans-serif'],
            },
            boxShadow: {
                'neu': '4px 4px 0px 0px rgba(0,0,0,1)',
                'neu-hover': '2px 2px 0px 0px rgba(0,0,0,1)',
                'neu-active': '0px 0px 0px 0px rgba(0,0,0,1)',
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
