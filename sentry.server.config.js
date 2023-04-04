// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

// check if dev mode
const isDev = process.env.NODE_ENV !== 'production';

if (!isDev && SENTRY_DSN) {

    Sentry.init({
        dsn: SENTRY_DSN,
        environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
        tracesSampleRate: 1.0,
        release: "quicktest@" + process.env.npm_package_version,
    });
}