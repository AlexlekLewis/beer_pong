/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary - Golden Beer Tones
                gold: {
                    light: '#ffd700',
                    main: '#ffa500',
                    DEFAULT: '#ffa500',
                    dark: '#ff8c00',
                },
                // Secondary - Party Purples
                purple: {
                    dark: '#4a0e4e',
                    main: '#6b21a8',
                    DEFAULT: '#6b21a8',
                },
                // Accent colors
                fierce: {
                    red: '#dc143c',
                    orange: '#ff4500',
                },
                // Background colors
                bg: {
                    dark: '#0f0a15',
                    card: 'rgba(30, 20, 45, 0.8)',
                    elevated: '#1e1428',
                },
            },
            fontFamily: {
                display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
                body: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
                accent: ['"Permanent Marker"', 'cursive'],
            },
            animation: {
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
                'float': 'float 3s ease-in-out infinite',
                'text-glow': 'text-glow 2s ease-in-out infinite',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 10px rgba(255, 165, 0, 0.5)' },
                    '50%': { boxShadow: '0 0 30px rgba(255, 165, 0, 0.5), 0 0 50px rgba(255, 165, 0, 0.5)' },
                },
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '20%': { transform: 'translateX(-8px) rotate(-1deg)' },
                    '40%': { transform: 'translateX(8px) rotate(1deg)' },
                    '60%': { transform: 'translateX(-6px) rotate(-0.5deg)' },
                    '80%': { transform: 'translateX(6px) rotate(0.5deg)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'text-glow': {
                    '0%, 100%': { textShadow: '0 0 10px rgba(255, 165, 0, 0.5)' },
                    '50%': { textShadow: '0 0 20px rgba(255, 165, 0, 0.5), 0 0 40px rgba(255, 165, 0, 0.5)' },
                },
            },
        },
    },
    plugins: [],
}
