// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
    sentry: {
        tunnelRoute: "/api/tunnel",
    },
    reactStrictMode: true,
    swcMinify: true,
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback.fs = false;
        }
        return config;
    },
    // pageExtensions: ['page.tsx', "api.ts", "page.ts"],
    i18n: {
        locales: ["de"],
        defaultLocale: "de",
    }
};

module.exports = nextConfig;

module.exports = withSentryConfig(
    module.exports,
    { silent: true },
    { hideSourcemaps: true },
);
