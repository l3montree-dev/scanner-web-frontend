/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    pageExtensions: ['page.tsx', "api.ts"],
    i18n: {
        locales: ["de"],
        defaultLocale: "de",
    }
};

module.exports = nextConfig;
