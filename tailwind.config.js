const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'sans': ['OpenSans', ...defaultTheme.fontFamily.sans],
            },
            "colors": {
                deepblue: {
                    "50": "#383f6a",
                    "100": "#2e3560",
                    "200": "#242b56",
                    "300": "#1a214c",
                    "400": "#101742",
                    "500": "#060d38",
                    "600": "#00032e",
                    "700": "#000024",
                    "800": "#00001a",
                    "900": "#000010"
                },
                silver: "#85878b",
                lightning: {
                    "50": "#deffff",
                    "100": "#d4fff7",
                    "200": "#caffed",
                    "300": "#c0ffe3",
                    "400": "#b6ffd9",
                    "500": "#acfccf",
                    "600": "#a2f2c5",
                    "700": "#98e8bb",
                    "800": "#8edeb1",
                    "900": "#84d4a7"
                }
            },
        },
    },
    plugins: [],
};
