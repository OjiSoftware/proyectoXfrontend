import type { Config } from "tailwindcss";
import flowbite from "flowbite/plugin";

const config: Config = {
    content: [
        "./index.html",
        "./src/**/*.{ts,tsx,js,jsx}",
        "node_modules/flowbite-react/**/*.{js,ts,jsx,tsx}",
        "node_modules/flowbite/**/*.js",
    ],
    theme: {
        // Al ponerlo directamente aquí (fuera de extend), sobrescribes las predeterminadas
        fontFamily: {
            sans: ['Poppins', 'Inter', 'sans-serif'],
            serif: ['Domine', 'serif'],
            domine: ['Domine', 'serif'],
            poppins: ['Poppins', 'sans-serif'],
        },
        extend: {
            colors: {
                primary: "#EDC062", // Gold
                secondary: "#9E9494", // Taupe
                dark: "#1A2D2A", // Deep Charcoal
                accent: "#FAD390", // Soft Gold
            },
            keyframes: {
                "fade-in": {
                    "0%": { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
            },
            animation: {
                "fade-in": "fade-in 0.2s ease-out forwards",
            },
        },
    },
    plugins: [flowbite],
};

export default config;
