/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    i18n: {
        locales: ["de"],
        defaultLocale: "de",
    },
    unstable_allowDynamic: [

        '/node_modules/@babel/**', // use a glob to allow anything in the function-bind 3rd party module
    ],
};

module.exports = nextConfig;
