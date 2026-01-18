/** @type {import('tailwindcss').Config} */
export default {
    // Esport Theme Update - Force Rebuild
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--primary)',
                secondary: 'var(--secondary)',
                accent: 'var(--accent)',
                danger: 'var(--danger)',
                warning: 'var(--warning)',
                bg: {
                    dark: 'var(--bg-dark)',
                    card: 'var(--bg-card)',
                    elevated: 'var(--bg-elevated)',
                },
            },
            fontFamily: {
                orbitron: ['Orbitron', 'sans-serif'],
                rajdhani: ['Rajdhani', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
