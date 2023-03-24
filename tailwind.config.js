const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: [
        "text-yellow-500",
        "text-red-500",
        "border-red-500",
        "text-red-500",
        "text-lightning-500",
        "border-lightning-500",
        "text-gray-500",
        "border-gray-500",
        "text-deepblue-900"
    ],
    theme: {
        extend: {
            fontFamily: {
                'sans': ['OpenSans', ...defaultTheme.fontFamily.sans],
            },
            flexBasis: {
                "1/2": "50%",
                "1/3": "33.333333%",
                "2/3": "66.666667%",
                "1/4": "25%",
                "3/4": "75%",
                "1/5": "20%",
                "2/5": "40%",
                "3/5": "60%",
                "4/5": "80%",
                "1/6": "16.666667%",
                "5/6": "83.333333%",
                "1/12": "8.333333%",
                "5/12": "41.666667%",
                "7/12": "58.333333%",
                "11/12": "91.666667%",
                "1/16": "6.25%",
                "2/16": "12.5%",
                "3/16": "18.75%",
                "4/16": "25%",
                "5/16": "31.25%",
                "6/16": "37.5%",
                "7/16": "43.75%",
                "8/16": "50%",
                "9/16": "56.25%",
                "10/16": "62.5%",
                "11/16": "68.75%",
                "12/16": "75%",
                "13/16": "81.25%",
                "14/16": "87.5%",
                "15/16": "93.75%",
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
