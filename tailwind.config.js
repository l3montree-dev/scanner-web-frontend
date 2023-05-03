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
        container: {
            center: true,
            padding: '2rem',
            screens: {
                'sm': '100%',
                'md': '100%',
                'lg': '73.125rem',
            }
        },
        fontSize: {
            sm: '0.8rem',
            base: '1.5rem',
            lg: '1.625rem',
            xl: '1.75rem',
            '2xl': '3.5rem',
        },
        borderWidth: {
            DEFAULT: '1px',
            '0': '0',
            '2': '2px',
            '3': '3px',
            '4': '4px',
            '6': '6px',
            '8': '8px',
            '10': '10px',
        },
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
                bund: "#004F80",
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
                },
                blau: {
                    "20": "#CCE4F0",
                    "40": "#99C9E2",
                    "60": "#66ADD3",
                    "80": "#3392C5",
                    "100": "#0077B6",
                },
                textblack: "#111314",
                dunkelblau: {
                    "20": "#CCDBE4",
                    "40": "#99B7C8",
                    "60": "#6693AD",
                    "80": "#336F91",
                    "100": "#004B76",
                },
                dunkelgrau: {
                    "20": "#DDDFE0",
                    "40": "#BCC0C1",
                    "60": "#9AA0A2",
                    "80": "#798183",
                    "100": "#576164",
                },
                hellgrau: {
                    "20": "#F2F3F4",
                    "40": "#E5E8E9",
                    "60": "#D8DCDF",
                    "80": "#CBD1D4",
                    "100": "#BEC5C9",
                },
                dunkelgruen: {
                    "20": "#CCDEDA",
                    "40": "#99BEB5",
                    "60": "#669D8F",
                    "80": "#337D6A",
                    "100": "#005C45",
                },
                gruen: {
                    "20": "#CCE7DB",
                    "40": "#99CEB7",
                    "60": "#66B692",
                    "80": "#339D6E",
                    "100": "#00854A",
                },
                hellorange: {
                    "20": "#FDF1D8",
                    "40": "#FCE4B1",
                    "60": "#FAD68B",
                    "80": "#F9C964",
                    "100": "#F7BB3D",
                },
                rot: {
                    "20": "#F2CCD8",
                    "40": "#E699B1",
                    "60": "#D9668A",
                    "80": "#CD3363",
                    "100": "#C0003C",
                },
                dunkelrot: {
                    "20": "#933F57",
                    "40": "#933F57",
                    "60": "#933F57",
                    "80": "#933F57",
                    "100": "#780F2D",
                },
                violett: {
                    "20": "#DFD6DE",
                    "40": "#BFADBC",
                    "60": "#9F839B",
                    "80": "#7F5A79",
                    "100": "#5F316E",
                },
                orange: {
                    "20": "#F5DCD7",
                    "40": "#EBB9AF",
                    "60": "#E19688",
                    "80": "#D77360",
                    "100": "#CD5038",
                },
                gelb: {
                    "20": "#FEF9D8",
                    "40": "#FDF3B0",
                    "60": "#FBEC89",
                    "80": "#FAE661",
                    "100": "#F9E03A",
                },
                hellgruen: {
                    "20": "#F3F4D6",
                    "40": "#E6EAAD",
                    "60": "#DADF83",
                    "80": "#CDD55A",
                    "100": "#C1CA31",
                },
                oliv: {
                    "20": "#9BB088",
                    "40": "#9BB088",
                    "60": "#9BB088",
                    "80": "#7A9661",
                    "100": "#597C39",
                },
                tuerkis: {
                    "20": "#CCE6E8",
                    "40": "#99CDD1",
                    "60": "#66B3B9",
                    "80": "#339AA2",
                    "100": "#00818B",
                },
                hellblau: {
                    "20": "#E6F5FB",
                    "40": "#CCEBF7",
                    "60": "#B3E1F4",
                    "80": "#99D7F0",
                    "100": "#80CDEC",
                },
                dunkelblau: {
                    "20": "#CCDBE4",
                    "40": "#99B7C8",
                    "60": "#6693AD",
                    "80": "#336F91",
                    "100": "#004B76",
                }
            },
        },
    },
    plugins: [],
};
